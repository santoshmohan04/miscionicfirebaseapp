package io.ionic.starter;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.os.StatFs;
import android.provider.MediaStore;
import android.provider.Settings;
import android.util.Log;

import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.PermissionState;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.ActivityCallback;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.io.File;

@CapacitorPlugin(
    name = "StorageStats",
    permissions = {
        @Permission(
            alias = "storage",
            strings = { Manifest.permission.READ_EXTERNAL_STORAGE, Manifest.permission.WRITE_EXTERNAL_STORAGE }
        )
    }
)
public class StorageStatsPlugin extends Plugin {
    
    private static final String TAG = "StorageStats";

    @PluginMethod
    public void getStatistics(PluginCall call) {
        JSObject ret = new JSObject();

        try {
            // 1. Get total and free space on the external storage partition
            File path = Environment.getExternalStorageDirectory();
            StatFs stat = new StatFs(path.getPath());
            long blockSize = stat.getBlockSizeLong();
            long totalBlocks = stat.getBlockCountLong();
            long availableBlocks = stat.getAvailableBlocksLong();

            long totalSpace = totalBlocks * blockSize;
            long freeSpace = availableBlocks * blockSize;
            long usedSpace = totalSpace - freeSpace;

            ret.put("totalSpace", totalSpace);
            ret.put("freeSpace", freeSpace);
            ret.put("usedSpace", usedSpace);

            // 2. Get category sizes and counts using Android MediaStore
            JSObject imagesStats = getCategorySizeAndCount(MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
            ret.put("imagesSize", imagesStats.getLong("size"));
            ret.put("imagesCount", imagesStats.getInteger("count"));

            JSObject videosStats = getCategorySizeAndCount(MediaStore.Video.Media.EXTERNAL_CONTENT_URI);
            ret.put("videosSize", videosStats.getLong("size"));
            ret.put("videosCount", videosStats.getInteger("count"));

            JSObject audioStats = getCategorySizeAndCount(MediaStore.Audio.Media.EXTERNAL_CONTENT_URI);
            ret.put("audioSize", audioStats.getLong("size"));
            ret.put("audioCount", audioStats.getInteger("count"));

            long docsSize = 0;
            int docsCount = 0;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                JSObject docsStats = getCategorySizeAndCount(MediaStore.Downloads.EXTERNAL_CONTENT_URI);
                docsSize = docsStats.getLong("size");
                docsCount = docsStats.getInteger("count");
            }
            ret.put("documentsSize", docsSize);
            ret.put("documentsCount", docsCount);

            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Unable to retrieve storage statistics", e);
        }
    }

    private JSObject getCategorySizeAndCount(Uri uri) {
        JSObject result = new JSObject();
        long totalSize = 0;
        int count = 0;
        
        String[] projection = { MediaStore.MediaColumns.SIZE };
        try (Cursor cursor = getContext().getContentResolver().query(uri, projection, null, null, null)) {
            if (cursor != null) {
                int sizeColumn = cursor.getColumnIndexOrThrow(MediaStore.MediaColumns.SIZE);
                while (cursor.moveToNext()) {
                    totalSize += cursor.getLong(sizeColumn);
                    count++;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        result.put("size", totalSize);
        result.put("count", count);
        return result;
    }

    private long getCategorySize(Uri uri) {
        long totalSize = 0;
        String[] projection = { MediaStore.MediaColumns.SIZE };
        try (Cursor cursor = getContext().getContentResolver().query(uri, projection, null, null, null)) {
            if (cursor != null) {
                int sizeColumn = cursor.getColumnIndexOrThrow(MediaStore.MediaColumns.SIZE);
                while (cursor.moveToNext()) {
                    totalSize += cursor.getLong(sizeColumn);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return totalSize;
    }

    @PluginMethod
    public void getLargestFiles(PluginCall call) {
        Integer limit = call.getInt("limit", 10);
        JSObject ret = new JSObject();
        
        try {
            org.json.JSONArray largestFiles = queryLargestFilesAcrossCategories(limit);
            ret.put("files", largestFiles);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Unable to retrieve largest files", e);
        }
    }

    private org.json.JSONArray queryLargestFilesAcrossCategories(int limit) {
        org.json.JSONArray allFiles = new org.json.JSONArray();
        
        // Query images
        addFilesFromUri(allFiles, MediaStore.Images.Media.EXTERNAL_CONTENT_URI, "image");
        
        // Query videos
        addFilesFromUri(allFiles, MediaStore.Video.Media.EXTERNAL_CONTENT_URI, "video");
        
        // Query audio
        addFilesFromUri(allFiles, MediaStore.Audio.Media.EXTERNAL_CONTENT_URI, "audio");
        
        // Query downloads (Android Q+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            addFilesFromUri(allFiles, MediaStore.Downloads.EXTERNAL_CONTENT_URI, "document");
        }
        
        // Sort by size and limit
        java.util.List<org.json.JSONObject> filesList = new java.util.ArrayList<>();
        for (int i = 0; i < allFiles.length(); i++) {
            try {
                filesList.add(allFiles.getJSONObject(i));
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        
        // Sort by size descending
        filesList.sort((a, b) -> {
            try {
                long sizeA = a.getLong("size");
                long sizeB = b.getLong("size");
                return Long.compare(sizeB, sizeA);
            } catch (Exception e) {
                return 0;
            }
        });
        
        // Take top N
        org.json.JSONArray result = new org.json.JSONArray();
        for (int i = 0; i < Math.min(limit, filesList.size()); i++) {
            result.put(filesList.get(i));
        }
        
        return result;
    }

    private void addFilesFromUri(org.json.JSONArray allFiles, Uri contentUri, String category) {
        String[] projection = {
            MediaStore.MediaColumns._ID,
            MediaStore.MediaColumns.DISPLAY_NAME,
            MediaStore.MediaColumns.SIZE,
            MediaStore.MediaColumns.MIME_TYPE,
            MediaStore.MediaColumns.DATA
        };
        
        try (Cursor cursor = getContext().getContentResolver().query(
                contentUri,
                projection,
                null,
                null,
                MediaStore.MediaColumns.SIZE + " DESC"
        )) {
            if (cursor != null) {
                int idColumn = cursor.getColumnIndexOrThrow(MediaStore.MediaColumns._ID);
                int nameColumn = cursor.getColumnIndexOrThrow(MediaStore.MediaColumns.DISPLAY_NAME);
                int sizeColumn = cursor.getColumnIndexOrThrow(MediaStore.MediaColumns.SIZE);
                int mimeColumn = cursor.getColumnIndexOrThrow(MediaStore.MediaColumns.MIME_TYPE);
                int dataColumn = cursor.getColumnIndexOrThrow(MediaStore.MediaColumns.DATA);
                
                int count = 0;
                int maxPerCategory = 50; // Limit files read per category for performance
                while (cursor.moveToNext() && count < maxPerCategory) {
                    try {
                        org.json.JSONObject fileObj = new org.json.JSONObject();
                        fileObj.put("id", cursor.getString(idColumn));
                        fileObj.put("name", cursor.getString(nameColumn));
                        fileObj.put("size", cursor.getLong(sizeColumn));
                        fileObj.put("mimeType", cursor.getString(mimeColumn));
                        fileObj.put("path", cursor.getString(dataColumn));
                        fileObj.put("category", category);
                        allFiles.put(fileObj);
                        count++;
                    } catch (Exception e) {
                        // Skip files that cause errors
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @PluginMethod
    public void checkStoragePermission(PluginCall call) {
        JSObject ret = new JSObject();
        boolean granted = false;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            // Android 11+ (API 30+) - Check MANAGE_EXTERNAL_STORAGE
            granted = Environment.isExternalStorageManager();
        } else {
            // Android 10 and below - Check READ_EXTERNAL_STORAGE
            granted = ContextCompat.checkSelfPermission(
                getContext(),
                Manifest.permission.READ_EXTERNAL_STORAGE
            ) == PackageManager.PERMISSION_GRANTED;
        }

        ret.put("granted", granted);
        call.resolve(ret);
    }

    @PluginMethod
    public void requestStoragePermission(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            // Android 11+ (API 30+) - Request MANAGE_EXTERNAL_STORAGE
            try {
                Intent intent = new Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION);
                intent.setData(Uri.parse("package:" + getContext().getPackageName()));
                startActivityForResult(call, intent, "manageStoragePermCallback");
            } catch (Exception e) {
                call.reject("Failed to open settings", e);
            }
        } else {
            // Android 10 and below - Request READ_EXTERNAL_STORAGE via Capacitor permission system
            if (getPermissionState("storage") != PermissionState.GRANTED) {
                requestPermissionForAlias("storage", call, "storagePermissionCallback");
            } else {
                call.resolve();
            }
        }
    }

    @PermissionCallback
    private void storagePermissionCallback(PluginCall call) {
        if (getPermissionState("storage") == PermissionState.GRANTED) {
            call.resolve();
        } else {
            call.reject("Storage permission denied");
        }
    }

    @ActivityCallback
    private void manageStoragePermCallback(PluginCall call, ActivityResult result) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R && Environment.isExternalStorageManager()) {
            call.resolve();
        } else {
            call.reject("Storage permission denied");
        }
    }

    @PluginMethod
    public void openFile(PluginCall call) {
        String idStr = call.getString("id");
        String category = call.getString("category");
        String mimeType = call.getString("mimeType", "*/*");

        if (idStr == null || category == null) {
            call.reject("File ID and category are required");
            return;
        }

        try {
            long id = Long.parseLong(idStr);
            Uri contentUri = getCategoryContentUri(category);

            if (contentUri == null) {
                call.reject("Invalid category: " + category);
                return;
            }

            Uri fileUri = android.content.ContentUris.withAppendedId(contentUri, id);

            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(fileUri, mimeType);
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            Log.e(TAG, "Failed to open file", e);
            call.reject("Failed to open file", e);
        }
    }

    @PluginMethod
    public void getFilesByCategory(PluginCall call) {
        String category = call.getString("category", "");
        Integer limit = call.getInt("limit", 10000); // Default limit 10000 files to show all content
        
        Log.d(TAG, "getFilesByCategory called - category: " + category + ", limit: " + limit);
        
        if (category.isEmpty()) {
            call.reject("Category parameter is required");
            return;
        }

        try {
            Uri contentUri = getCategoryContentUri(category);
            if (contentUri == null) {
                call.reject("Invalid category: " + category);
                return;
            }

            Log.d(TAG, "Querying MediaStore URI: " + contentUri);
            org.json.JSONArray filesArray = queryMediaFiles(contentUri, category, limit);
            Log.d(TAG, "Query returned " + filesArray.length() + " files");
            
            if (filesArray.length() == limit) {
                Log.w(TAG, "\u26a0\ufe0f Query limit reached! There may be more files available.");
            }
            
            JSObject ret = new JSObject();
            ret.put("files", filesArray);
            call.resolve(ret);
        } catch (Exception e) {
            Log.e(TAG, "Failed to query files for category: " + category, e);
            call.reject("Failed to query files", e);
        }
    }

    private Uri getCategoryContentUri(String category) {
        switch (category.toLowerCase()) {
            case "images":
                return MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
            case "videos":
                return MediaStore.Video.Media.EXTERNAL_CONTENT_URI;
            case "audio":
                return MediaStore.Audio.Media.EXTERNAL_CONTENT_URI;
            case "downloads":
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    return MediaStore.Downloads.EXTERNAL_CONTENT_URI;
                } else {
                    // For older Android versions, use Files content URI with download path filter
                    return MediaStore.Files.getContentUri("external");
                }
            default:
                return null;
        }
    }

    private org.json.JSONArray queryMediaFiles(Uri contentUri, String category, int limit) {
        org.json.JSONArray filesArray = new org.json.JSONArray();
        
        Log.d(TAG, "Querying category: " + category + " with limit: " + limit);
        
        String[] projection = getProjectionForCategory(category, contentUri);
        
        // Add selection for downloads on older Android versions
        String selection = null;
        String[] selectionArgs = null;
        
        if (category.equals("downloads") && Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
            // Filter for download directory on older Android
            selection = MediaStore.MediaColumns.DATA + " LIKE ?";
            selectionArgs = new String[]{"%/Download/%"};
            Log.d(TAG, "Using path filter for downloads on Android < Q");
        }

        Cursor queryCursor;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            android.os.Bundle queryArgs = new android.os.Bundle();
            if (selection != null) {
                queryArgs.putString(android.content.ContentResolver.QUERY_ARG_SQL_SELECTION, selection);
                queryArgs.putStringArray(android.content.ContentResolver.QUERY_ARG_SQL_SELECTION_ARGS, selectionArgs);
            }
            queryArgs.putString(android.content.ContentResolver.QUERY_ARG_SQL_SORT_ORDER, MediaStore.MediaColumns.DATE_MODIFIED + " DESC");
            queryArgs.putInt(android.content.ContentResolver.QUERY_ARG_LIMIT, limit);
            queryCursor = getContext().getContentResolver().query(contentUri, projection, queryArgs, null);
        } else {
            String sortOrder = MediaStore.MediaColumns.DATE_MODIFIED + " DESC LIMIT " + limit;
            queryCursor = getContext().getContentResolver().query(contentUri, projection, selection, selectionArgs, sortOrder);
        }

        try (Cursor cursor = queryCursor) {
            if (cursor != null) {
                Log.d(TAG, "Cursor count: " + cursor.getCount());
                int idColumn = cursor.getColumnIndexOrThrow(MediaStore.MediaColumns._ID);
                int nameColumn = cursor.getColumnIndexOrThrow(MediaStore.MediaColumns.DISPLAY_NAME);
                int dataColumn = cursor.getColumnIndexOrThrow(MediaStore.MediaColumns.DATA);
                int sizeColumn = cursor.getColumnIndexOrThrow(MediaStore.MediaColumns.SIZE);
                int mimeColumn = cursor.getColumnIndexOrThrow(MediaStore.MediaColumns.MIME_TYPE);
                int dateColumn = cursor.getColumnIndexOrThrow(MediaStore.MediaColumns.DATE_MODIFIED);

                // Optional columns based on category
                int durationColumn = -1;
                int widthColumn = -1;
                int heightColumn = -1;

                try {
                    if (category.equals("videos") || category.equals("audio")) {
                        durationColumn = cursor.getColumnIndex(MediaStore.Video.Media.DURATION);
                    }
                    if (category.equals("images") || category.equals("videos")) {
                        widthColumn = cursor.getColumnIndex(MediaStore.MediaColumns.WIDTH);
                        heightColumn = cursor.getColumnIndex(MediaStore.MediaColumns.HEIGHT);
                    }
                } catch (Exception e) {
                    // Column may not exist in older Android versions
                }

                int count = 0;
                while (cursor.moveToNext() && count < limit) {
                    try {
                        JSObject fileObj = new JSObject();
                        long id = cursor.getLong(idColumn);
                        
                        fileObj.put("id", String.valueOf(id));
                        fileObj.put("name", cursor.getString(nameColumn));
                        fileObj.put("path", cursor.getString(dataColumn));
                        fileObj.put("size", cursor.getLong(sizeColumn));
                        fileObj.put("mimeType", cursor.getString(mimeColumn));
                        fileObj.put("dateModified", cursor.getLong(dateColumn) * 1000); // Convert to milliseconds

                        // Add thumbnail URI for images and videos
                        if (category.equals("images") || category.equals("videos")) {
                            Uri thumbnailUri = Uri.withAppendedPath(contentUri, String.valueOf(id));
                            fileObj.put("thumbnailUri", thumbnailUri.toString());
                        }

                        // Add duration for videos and audio
                        if (durationColumn != -1 && !cursor.isNull(durationColumn)) {
                            fileObj.put("duration", cursor.getLong(durationColumn));
                        }

                        // Add dimensions for images and videos
                        if (widthColumn != -1 && !cursor.isNull(widthColumn)) {
                            fileObj.put("width", cursor.getInt(widthColumn));
                        }
                        if (heightColumn != -1 && !cursor.isNull(heightColumn)) {
                            fileObj.put("height", cursor.getInt(heightColumn));
                        }

                        filesArray.put(fileObj);
                        count++;
                    } catch (Exception e) {
                        // Skip files that cause errors
                        Log.e(TAG, "Error processing file: " + e.getMessage());
                        e.printStackTrace();
                    }
                }
                Log.d(TAG, "Processed " + count + " files for category: " + category);
            } else {
                Log.w(TAG, "Cursor is null for category: " + category);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error querying media files: " + e.getMessage());
            e.printStackTrace();
        }

        Log.d(TAG, "Returning " + filesArray.length() + " files");
        return filesArray;
    }

    private String[] getProjectionForCategory(String category, Uri contentUri) {
        java.util.List<String> projectionList = new java.util.ArrayList<>();
        
        // Base columns for all categories
        projectionList.add(MediaStore.MediaColumns._ID);
        projectionList.add(MediaStore.MediaColumns.DISPLAY_NAME);
        projectionList.add(MediaStore.MediaColumns.DATA);
        projectionList.add(MediaStore.MediaColumns.SIZE);
        projectionList.add(MediaStore.MediaColumns.MIME_TYPE);
        projectionList.add(MediaStore.MediaColumns.DATE_MODIFIED);

        // Category-specific columns
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            if (category.equals("images") || category.equals("videos")) {
                projectionList.add(MediaStore.MediaColumns.WIDTH);
                projectionList.add(MediaStore.MediaColumns.HEIGHT);
            }
            if (category.equals("videos") || category.equals("audio")) {
                projectionList.add(MediaStore.Video.Media.DURATION);
            }
        }

        return projectionList.toArray(new String[0]);
    }
}