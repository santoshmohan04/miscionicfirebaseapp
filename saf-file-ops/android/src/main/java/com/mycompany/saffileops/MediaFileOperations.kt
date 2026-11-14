package com.mycompany.saffileops

import android.content.Context
import android.media.MediaScannerConnection
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.system.Os
import android.system.OsConstants
import androidx.documentfile.provider.DocumentFile
import java.io.File
import java.io.IOException
import java.io.InputStream
import java.nio.file.Files
import java.security.MessageDigest
import java.util.UUID
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

internal class MediaFileOperations(private val context: Context) {
    private val resolver = context.contentResolver

    private data class Source(val uri: Uri, val file: File, val name: String)

    fun rename(uri: String, name: String, newName: String) {
        validateName(newName)
        val source = source(uri, name, requireWrite = true)
        if (newName == source.name) return
        val parent = source.file.parentFile ?: throw IOException("File has no parent folder")
        val target = File(parent, newName)
        if (target.exists()) throw IOException("A file named $newName already exists")
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            throw IOException("Renaming requires Android 8 or later")
        }
        Files.move(source.file.toPath(), target.toPath())
        scan(source.file.path, target.path)
    }

    fun delete(uri: String, name: String) {
        val source = source(uri, name, requireWrite = true)
        if (!source.file.delete()) throw IOException("Unable to delete ${source.name}")
        scan(source.file.path)
    }

    fun transfer(uri: String, name: String, targetUri: String, existingUri: String?, move: Boolean) {
        val source = source(uri, name, requireWrite = move)
        val targetDir = DocumentFile.fromTreeUri(context, Uri.parse(targetUri))
            ?: throw IOException("Unable to open the destination folder")
        if (!targetDir.isDirectory || !targetDir.canWrite()) {
            throw IOException("Destination folder is not writable")
        }
        val existing = targetDir.findFile(name)
        if (existing?.uri?.toString() != existingUri) {
            throw IOException("Destination changed; choose the folder again")
        }
        if (existing != null) {
            if (existing.isDirectory) throw IOException("A folder named $name already exists")
            ensureDistinctFiles(source.uri, existing.uri)
        }

        val tempName = ".file-manager-${UUID.randomUUID()}.tmp"
        val temp = targetDir.createFile("application/octet-stream", tempName)
            ?: throw IOException("Unable to create a temporary destination file")
        var installed = false
        var backup: DocumentFile? = null
        try {
            val originalSize = source.file.length()
            val originalModified = source.file.lastModified()
            val (length, digest) = copyAndDigest(source.uri, temp.uri)
            if (length != originalSize || !digest.contentEquals(digest(temp.uri))) {
                throw IOException("The copied file could not be verified")
            }
            if (source.file.length() != originalSize || source.file.lastModified() != originalModified) {
                throw IOException("Source changed during copying")
            }

            if (existing != null) {
                val backupName = ".file-manager-${UUID.randomUUID()}.backup"
                if (!existing.renameTo(backupName)) {
                    throw IOException("Destination provider cannot safely replace $name")
                }
                backup = existing
                if (existing.name != backupName) {
                    throw IOException("Destination provider changed the backup name to ${existing.name}")
                }
            }
            if (!temp.renameTo(name) || temp.name != name) {
                throw IOException("Destination provider could not preserve the file name $name")
            }
            installed = true
            if (backup != null && !backup.delete()) {
                throw IOException("Replacement completed, but the backup ${backup.name} could not be removed")
            }
            backup = null

            if (move) {
                if (source.file.length() != originalSize ||
                    source.file.lastModified() != originalModified ||
                    !digest.contentEquals(digest(source.uri))) {
                    throw IOException("Copy completed, but source changed and was not deleted")
                }
                if (!source.file.delete()) {
                    throw IOException("Copy completed, but source could not be deleted")
                }
                scan(source.file.path)
            }
        } catch (error: Exception) {
            if (!installed) {
                val cleanupFailed = temp.exists() && !temp.delete()
                val backupName = backup?.name
                val restoreFailed = backup != null && (!backup.renameTo(name) || backup.name != name)
                if (cleanupFailed || restoreFailed) {
                    throw IOException(
                        "${error.message}; " +
                            (if (restoreFailed) "original kept as $backupName. " else "") +
                            (if (cleanupFailed) "temporary file ${temp.name} could not be removed." else ""),
                        error
                    )
                }
            }
            throw error
        }
    }

    private fun source(rawUri: String, expectedName: String, requireWrite: Boolean): Source {
        validateName(expectedName)
        val uri = Uri.parse(rawUri)
        if (uri.scheme != "content" || uri.authority != "media") {
            throw IOException("Expected an Android MediaStore file")
        }
        if (requireWrite && Build.VERSION.SDK_INT >= Build.VERSION_CODES.R && !Environment.isExternalStorageManager()) {
            throw IOException("All files access is required to modify this file")
        }
        val projection = arrayOf(MediaStore.MediaColumns.DATA, MediaStore.MediaColumns.DISPLAY_NAME)
        val cursor = resolver.query(uri, projection, null, null, null)
            ?: throw IOException("Unable to find $expectedName")
        cursor.use {
            if (!it.moveToFirst()) throw IOException("File no longer exists: $expectedName")
            val path = it.getString(it.getColumnIndexOrThrow(MediaStore.MediaColumns.DATA))
                ?: throw IOException("File has no accessible storage path: $expectedName")
            val name = it.getString(it.getColumnIndexOrThrow(MediaStore.MediaColumns.DISPLAY_NAME))
            if (name != expectedName) throw IOException("File changed; refresh and try again")
            val file = File(path).canonicalFile
            if (!file.isFile || file.name != name || !file.canRead()) {
                throw IOException("File is no longer accessible: $expectedName")
            }
            if (requireWrite && !file.canWrite()) throw IOException("File is not writable: $expectedName")
            return Source(uri, file, name)
        }
    }

    private fun validateName(name: String) {
        if (name.isBlank() || name == "." || name == ".." ||
            name.contains('/') || name.contains('\\') || name.contains('\u0000')) {
            throw IOException("Enter a valid file name without path separators")
        }
    }

    private fun ensureDistinctFiles(source: Uri, target: Uri) {
        try {
            val sourceFd = resolver.openFileDescriptor(source, "r")
                ?: throw IOException("Unable to inspect source file")
            sourceFd.use {
                val targetFd = resolver.openFileDescriptor(target, "r")
                    ?: throw IOException("Unable to inspect destination file")
                targetFd.use {
                    val a = Os.fstat(sourceFd.fileDescriptor)
                    val b = Os.fstat(targetFd.fileDescriptor)
                    if (!OsConstants.S_ISREG(a.st_mode) || !OsConstants.S_ISREG(b.st_mode)) {
                        throw IOException("Cannot safely identify the existing destination file")
                    }
                    if (a.st_dev == b.st_dev && a.st_ino == b.st_ino) {
                        throw IOException("Source and destination are the same file")
                    }
                }
            }
        } catch (e: IOException) {
            throw e
        } catch (e: Exception) {
            throw IOException("Cannot safely identify the existing destination file", e)
        }
    }

    private fun copyAndDigest(source: Uri, target: Uri): Pair<Long, ByteArray> {
        val hash = MessageDigest.getInstance("SHA-256")
        val input = resolver.openInputStream(source) ?: throw IOException("Unable to read source file")
        return input.use {
            val output = resolver.openOutputStream(target, "w")
                ?: throw IOException("Unable to write destination file")
            output.use { out ->
                val buffer = ByteArray(64 * 1024)
                var total = 0L
                while (true) {
                    val count = it.read(buffer)
                    if (count < 0) break
                    out.write(buffer, 0, count)
                    hash.update(buffer, 0, count)
                    total += count
                }
                total to hash.digest()
            }
        }
    }

    private fun digest(uri: Uri): ByteArray {
        val hash = MessageDigest.getInstance("SHA-256")
        val input: InputStream = resolver.openInputStream(uri) ?: throw IOException("Unable to verify file")
        input.use {
            val buffer = ByteArray(64 * 1024)
            while (true) {
                val count = it.read(buffer)
                if (count < 0) break
                hash.update(buffer, 0, count)
            }
        }
        return hash.digest()
    }

    private fun scan(vararg paths: String) {
        val latch = CountDownLatch(paths.size)
        MediaScannerConnection.scanFile(context, paths, null) { _, _ -> latch.countDown() }
        if (!latch.await(20, TimeUnit.SECONDS)) {
            throw IOException("File operation completed, but media refresh timed out")
        }
    }
}
