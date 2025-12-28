package com.mycompany.saffileops

import android.net.Uri
import androidx.documentfile.provider.DocumentFile
import com.getcapacitor.*
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin(name = "SafFileOps")
class SafFileOpsPlugin : Plugin() {

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
                doc?.delete()
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
        val targetUri = Uri.parse(call.getString("targetUri"))

        if (items == null) {
            call.reject("Invalid args")
            return
        }

        val targetDir = DocumentFile.fromTreeUri(context, targetUri)
            ?: return call.reject("Invalid target")

        try {
            for (i in 0 until items.length()) {
                val obj = items.getJSONObject(i)
                val srcUri = Uri.parse(obj.getString("uri"))
                val name = obj.getString("name")

                val src = DocumentFile.fromSingleUri(context, srcUri) ?: continue
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
        val targetUri = Uri.parse(call.getString("targetUri"))

        if (items == null) {
            call.reject("Invalid args")
            return
        }

        val targetDir = DocumentFile.fromTreeUri(context, targetUri)
            ?: return call.reject("Invalid target")

        try {
            for (i in 0 until items.length()) {
                val obj = items.getJSONObject(i)
                val srcUri = Uri.parse(obj.getString("uri"))
                val name = obj.getString("name")

                val src = DocumentFile.fromSingleUri(context, srcUri) ?: continue
                copyDocument(src, targetDir, name)
                src.delete()
            }
            call.resolve()
        } catch (e: Exception) {
            call.reject(e.message)
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
        val target = targetDir.createFile(mime, name) ?: return

        context.contentResolver.openInputStream(src.uri).use { input ->
            context.contentResolver.openOutputStream(target.uri).use { output ->
                input?.copyTo(output!!)
            }
        }
    }
}