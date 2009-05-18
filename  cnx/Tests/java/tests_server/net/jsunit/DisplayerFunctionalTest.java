package net.jsunit;

import net.jsunit.model.Browser;
import net.jsunit.model.BrowserLaunchSpecification;
import net.jsunit.model.BrowserResult;
import net.jsunit.utility.XmlUtility;
import org.jdom.Document;
import org.jdom.Element;

public class DisplayerFunctionalTest extends ServerFunctionalTestCase {

    protected boolean needsRealResultRepository() {
        return true;
    }

    public void testNoId() throws Exception {
        webTester.beginAt("displayer");
        Document responseDocument = responseXmlDocument();

        Element rootElement = responseDocument.getRootElement();
        assertErrorResponse(rootElement, "A Test Result ID and a browser ID must both be given");
    }

    public void testInvalidId() throws Exception {
        String id = String.valueOf(System.currentTimeMillis());
        webTester.beginAt("displayer?id=" + id + "&browserId=0");
        Document responseDocument = responseXmlDocument();

        Element rootElement = responseDocument.getRootElement();
        assertErrorResponse(rootElement, "No Test Result has been submitted with ID '" + id + "' for browser ID '0'");
    }

    public void testInvalidBrowserId() throws Exception {
        String id = String.valueOf(System.currentTimeMillis());
        webTester.beginAt("displayer?id=" + id + "&browserId=1000");
        Document responseDocument = responseXmlDocument();

        Element rootElement = responseDocument.getRootElement();
        assertErrorResponse(rootElement, "Invalid Browser ID '1000'");
    }

    public void testValid() throws Exception {
        Browser browser = new Browser(Browser.DEFAULT_SYSTEM_BROWSER, 0);
        server.launchBrowserTestRun(new BrowserLaunchSpecification(browser));
        BrowserResult browserResult = new BrowserResult();
        String id = String.valueOf(System.currentTimeMillis());
        browserResult.setId(id);
        browserResult.setBrowser(browser);
        server.accept(browserResult);
        webTester.beginAt("displayer?id=" + id + "&browserId=0");
        assertEquals(XmlUtility.asString(new Document(browserResult.asXml())), webTester.getDialog().getResponseText());
    }

}