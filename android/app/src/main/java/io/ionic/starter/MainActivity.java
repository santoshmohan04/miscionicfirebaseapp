package io.ionic.starter;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(com.mycompany.saffileops.SafFileOpsPlugin.class);
        registerPlugin(StorageStatsPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
