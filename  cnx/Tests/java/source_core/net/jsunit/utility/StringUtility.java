package net.jsunit.utility;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.*;

public class StringUtility {

    public static boolean isEmpty(String s) {
        return s == null || s.trim().equals("");
    }

    public static List<String> listFromCommaDelimitedString(String string) {
        return listFromDelimitedString(string, ",");
    }

    public static List<String> listFromSemiColonDelimitedString(String string) {
        return listFromDelimitedString(string, ";");
    }

    private static List<String> listFromDelimitedString(String string, String delimiter) {
        if (isEmpty(string))
            return new ArrayList<String>();
        String[] array = string.split(delimiter);
        for (int i = 0; i < array.length; i++)
            array[i] = array[i].trim();
        return Arrays.asList(array);
    }

    public static String stackTraceAsString(Throwable throwable) {
        StringWriter writer = new StringWriter();
        throwable.printStackTrace(new PrintWriter(writer));
        return writer.toString();
    }

    public static String commaSeparatedString(List<? extends Object> strings) {
        StringBuffer result = new StringBuffer();
        for (Iterator it = strings.iterator(); it.hasNext();) {
            result.append(it.next());
            if (it.hasNext())
                result.append(",");
        }
        return result.toString();
    }

    public static String unqualify(String string) {
        int indexOfForwardSlash = string.lastIndexOf("/");
        if (indexOfForwardSlash >= 0 && indexOfForwardSlash < string.length())
            string = string.substring(indexOfForwardSlash + 1);
        int indexOfBackSlash = string.lastIndexOf("\\");
        if (indexOfBackSlash >= 0 && indexOfBackSlash < string.length())
            string = string.substring(indexOfBackSlash + 1);
        return string;
    }

    public static String escapeForSuiteName(String host) {
        return host.replace('.', '\u00B7');
    }

    public static String stripWhiteSpace(String text) {
        return text.replaceAll("\\s", "");
    }

    public static String stripQuotes(String text) {
        return text.replaceAll("'", "").replace("\"", "");
    }

    public static String makeUnixFilenameSafe(String string) {
        return string.replaceAll("\\s", "_").replaceAll("\\\\", "__").replaceAll("/", "__");
    }

    public static String indent(int initialIndent, int subsequentIndents, String string) {
        boolean initial = true;
        StringBuffer buffer = new StringBuffer();
        String delimiter = "\n";

        for (StringTokenizer stringTokenizer = new StringTokenizer(string, delimiter, true); stringTokenizer.hasMoreTokens();) {
            String token = stringTokenizer.nextToken();
            if (!token.equals(delimiter)) {
                int indent = initial ? initialIndent : subsequentIndents;
                for (int i = 0; i < indent; i++) {
                    buffer.append(' ');
                }
                initial = false;
            }
            buffer.append(token);
        }

        return buffer.toString();
    }
}
