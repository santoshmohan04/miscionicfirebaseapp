package com.mycompany.saffileops

import android.app.Activity
import android.content.Intent
import android.content.SharedPreferences
import android.net.Uri
import androidx.documentfile.provider.DocumentFile
import com.getcapacitor.*
import com.getcapacitor.annotation.ActivityCallback
import com.getcapacitor.annotation.CapacitorPlugin
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException

@CapacitorPlugin(name = "SafFileOps")
class SafFileOpsPlugin : Plugin() {

    companion object {
        private const val PREFS_NAME = "saf_prefs"
        private const val ROOT_URI_KEY = "root_uri"
        private const val ROOT_NAME_KEY = "root_name"
        private const val PICK_ROOT_REQUEST = "pickRootResult"
    }

    /* =========================
       DELETE
       ========================= */
    @PluginMethod
    fun deleteItems(call: PluginCall) {
        val items = call.getArray("items") ?: run {
            call.reject("Items missing")
            return
        }

        try {
            for (i in 0 until items.length()) {
                val obj = items.getJSONObject(i)
                val uri = Uri.parse(obj.getString("uri"))

                val doc = DocumentFile.fromSingleUri(context, uri)
                    ?: throw IOException("Unable to access file: $uri")
                if (!doc.exists()) {
                    throw IOException("File does not exist: $uri")
                }
                if (!doc.delete()) {
                    throw IOException("Unable to delete file: $uri")
                }
            }
            call.resolve()
        } catch (e: Exception) {
            call.reject(e.message)
        }
    }

    /* =========================
       COPY
       ========================= */
    @PluginMethod
    fun copyItems(call: PluginCall) {
        val items = call.getArray("items")
        val targetUri = call.getString("targetUri")?.let(Uri::parse)

        if (items == null || targetUri == null) {
            call.reject("Invalid args")
            return
        }

        val targetDir = DocumentFile.fromTreeUri(context, targetUri)
            ?: return call.reject("Invalid target")

        try {
            if (!targetDir.isDirectory || !targetDir.canWrite()) {
                throw IOException("Target folder is not writable")
            }

            for (i in 0 until items.length()) {
                val obj = items.getJSONObject(i)
                val srcUri = Uri.parse(obj.getString("uri"))
                val name = obj.getString("name")

                val src = DocumentFile.fromSingleUri(context, srcUri)
                    ?: throw IOException("Unable to access source file: $srcUri")
                if (!src.exists() || src.isDirectory) {
                    throw IOException("Source is missing or is not a file: $srcUri")
                }
                copyDocument(src, targetDir, name)
            }
            call.resolve()
        } catch (e: Exception) {
            call.reject(e.message)
        }
    }

    /* =========================
       MOVE (COPY + DELETE)
       ========================= */
    @PluginMethod
    fun moveItems(call: PluginCall) {
        val items = call.getArray("items")
        val targetUri = call.getString("targetUri")?.let(Uri::parse)

        if (items == null || targetUri == null) {
            call.reject("Invalid args")
            return
        }

        val targetDir = DocumentFile.fromTreeUri(context, targetUri)
            ?: return call.reject("Invalid target")

        try {
            if (!targetDir.isDirectory || !targetDir.canWrite()) {
                throw IOException("Target folder is not writable")
            }

            for (i in 0 until items.length()) {
                val obj = items.getJSONObject(i)
                val srcUri = Uri.parse(obj.getString("uri"))
                val name = obj.getString("name")

                val src = DocumentFile.fromSingleUri(context, srcUri)
                    ?: throw IOException("Unable to access source file: $srcUri")
                if (!src.exists() || src.isDirectory) {
                    throw IOException("Source is missing or is not a file: $srcUri")
                }
                copyDocument(src, targetDir, name)
                if (!src.delete()) {
                    throw IOException("Copy succeeded but source could not be deleted: $srcUri")
                }
            }
            call.resolve()
        } catch (e: Exception) {
            call.reject(e.message)
        }
    }

    /* =========================
       PICK ROOT FOLDER
       ========================= */
    @PluginMethod
    fun pickRoot(call: PluginCall) {
        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT_TREE).apply {
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or
                    Intent.FLAG_GRANT_WRITE_URI_PERMISSION or
                    Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION)
        }

        startActivityForResult(call, intent, PICK_ROOT_REQUEST)
    }

    /* =========================
       LIST FOLDER CONTENTS
       ========================= */
    @PluginMethod
    fun listFolder(call: PluginCall) {
        val uriStr = call.getString("uri") ?: run {
            call.reject("URI missing")
            return
        }

        try {
            val uri = Uri.parse(uriStr)
            val dir = DocumentFile.fromTreeUri(context, uri) ?: run {
                call.reject("Invalid directory URI")
                return
            }

            val items = JSONArray()
            dir.listFiles().forEach { file ->
                val item = JSONObject().apply {
                    put("uri", file.uri.toString())
                    put("name", file.name ?: "Unknown")
                    put("isFolder", file.isDirectory)
                    put("size", file.length())
                    put("mimeType", file.type)
                    put("lastModified", file.lastModified())
                }
                items.put(item)
            }

            val result = JSONObject().apply {
                put("items", items)
            }
            call.resolve(JSObject.fromJSONObject(result))
        } catch (e: Exception) {
            call.reject(e.message)
        }
    }

    /* =========================
       GET PERSISTED ROOT
       ========================= */
    @PluginMethod
    fun getPersistedRoot(call: PluginCall) {
        val key = call.getString("key") ?: "default"
        android.util.Log.d("SafFileOps", "getPersistedRoot called with key: $key")
        val prefs = context.getSharedPreferences(PREFS_NAME, 0)
        val uriStr = prefs.getString("${ROOT_URI_KEY}_$key", null)
        val name = prefs.getString("${ROOT_NAME_KEY}_$key", null)
        android.util.Log.d("SafFileOps", "Retrieved uri: $uriStr, name: $name")

        if (uriStr != null && name != null) {
            val result = JSONObject().apply {
                put("uri", uriStr)
                put("name", name)
            }
            call.resolve(JSObject.fromJSONObject(result))
        } else {
            call.resolve() // null result
        }
    }

    /* =========================
       PERSIST ROOT
       ========================= */
    @PluginMethod
    fun persistRoot(call: PluginCall) {
        val uriStr = call.getString("uri") ?: run {
            android.util.Log.e("SafFileOps", "persistRoot: URI missing")
            call.reject("URI missing")
            return
        }
        val name = call.getString("name") ?: run {
            android.util.Log.e("SafFileOps", "persistRoot: Name missing")
            call.reject("Name missing")
            return
        }
        val key = call.getString("key") ?: "default"
        android.util.Log.d("SafFileOps", "persistRoot called - uri: $uriStr, name: $name, key: $key")

        try {
            val uri = Uri.parse(uriStr)
            context.contentResolver.takePersistableUriPermission(
                uri,
                Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION
            )

            val prefs = context.getSharedPreferences(PREFS_NAME, 0)
            prefs.edit().apply {
                putString("${ROOT_URI_KEY}_$key", uriStr)
                putString("${ROOT_NAME_KEY}_$key", name)
                apply()
            }
            android.util.Log.d("SafFileOps", "Root persisted successfully with key: $key")

            call.resolve()
        } catch (e: Exception) {
            call.reject(e.message)
        }
    }

    /* =========================
       HANDLE PICKER RESULT
       ========================= */
    @ActivityCallback
    private fun pickRootResult(call: PluginCall?, result: Intent?) {
        if (call == null) {
            android.util.Log.e("SafFileOps", "Call is null in pickRootResult")
            return
        }

        val uri = result?.data
        if (uri == null) {
            android.util.Log.e("SafFileOps", "No URI in result")
            call.reject("Picker cancelled or no URI returned")
            return
        }

        try {
            context.contentResolver.takePersistableUriPermission(
                uri,
                Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION
            )

            val doc = DocumentFile.fromTreeUri(context, uri)
            val name = doc?.name ?: "Storage"

            val ret = JSObject()
            ret.put("uri", uri.toString())
            ret.put("name", name)
            
            android.util.Log.d("SafFileOps", "Picker result: uri=$uri, name=$name")
            call.resolve(ret)
        } catch (e: Exception) {
            android.util.Log.e("SafFileOps", "Error in pickRootResult", e)
            call.reject("Error processing picker result: ${e.message}")
        }
    }

    /* =========================
       INTERNAL COPY HELPER
       ========================= */
    private fun copyDocument(
        src: DocumentFile,
        targetDir: DocumentFile,
        name: String
    ) {
        val mime = src.type ?: "application/octet-stream"
        var target: DocumentFile? = null
        try {
            val createdTarget = targetDir.createFile(mime, name)
                ?: throw IOException("Unable to create destination file: $name")
            target = createdTarget

            val expectedLength = src.length()
            val copiedLength = context.contentResolver.openInputStream(src.uri)?.use { input ->
                context.contentResolver.openOutputStream(createdTarget.uri)?.use { output ->
                    input.copyTo(output)
                } ?: throw IOException("Unable to open destination file: $name")
            } ?: throw IOException("Unable to open source file: ${src.uri}")

            if (expectedLength > 0 &&
                (copiedLength != expectedLength || createdTarget.length() != expectedLength)
            ) {
                throw IOException("Incomplete copy for source file: ${src.uri}")
            }
            if (!createdTarget.exists()) {
                throw IOException("Destination file was not created: $name")
            }
        } catch (e: Exception) {
            if (target?.exists() == true && !target.delete()) {
                throw IOException("Copy failed and partial destination could not be removed: $name", e)
            }
            throw e
        }
    }
}