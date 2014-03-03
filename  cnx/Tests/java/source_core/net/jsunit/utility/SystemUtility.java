package net.jsunit.utility;

import java.net.InetAddress;
import java.net.UnknownHostException;

public class SystemUtility {
    private static String hostname;

    public static String osArchitecture() {
        return System.getProperty("os.arch");
    }

    public static String osName() {
        return System.getProperty("os.name");
    }

    public static String osString() {
        StringBuffer result = new StringBuffer();
        result.append(osName());
        result.append(" - ");
        result.append(osArchitecture());
        return result.toString();
    }

    public static String hostname() {
        if (hostname == null) {
            //noinspection EmptyCatchBlock
            try {
                InetAddress addr = InetAddress.getLocalHost();
                hostname = addr.getCanonicalHostName();
            } catch (UnknownHostException e) {
            }
        }
        return hostname;
    }

    public static String ipAddress() {
        try {
            InetAddress addr = InetAddress.getLocalHost();
            return addr.getHostAddress();
        } catch (UnknownHostException e) {
            return null;
        }
    }

}
