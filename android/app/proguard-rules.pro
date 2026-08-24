# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

# ── Capacitor core ──────────────────────────────────────────────────────────
-keep class com.getcapacitor.** { *; }

# Keep all classes annotated as CapacitorPlugin and their @PluginMethod/@ActivityCallback/@PermissionCallback members
-keep @com.getcapacitor.annotation.CapacitorPlugin class * {
    @com.getcapacitor.annotation.PluginMethod <methods>;
    @com.getcapacitor.annotation.ActivityCallback <methods>;
    @com.getcapacitor.annotation.PermissionCallback <methods>;
}

# ── App-specific Capacitor plugins ──────────────────────────────────────────
-keep class io.ionic.starter.** { *; }

# ── SAF file-ops plugin (already has its own rules, kept here for safety) ──
-keep class com.mycompany.saffileops.** { *; }

# ── Keep plugin registration via reflection ──────────────────────────────────
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes Exceptions
