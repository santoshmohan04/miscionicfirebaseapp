# Keep Capacitor plugins
-keep class com.mycompany.saffileops.** { *; }
-keepnames class com.mycompany.saffileops.**
-keepclassmembers class com.mycompany.saffileops.** { *; }

# Keep Capacitor plugin annotations
-keep @com.getcapacitor.annotation.CapacitorPlugin class * {
    @com.getcapacitor.annotation.PluginMethod <methods>;
}
