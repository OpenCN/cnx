package net.jsunit.model;

import org.jdom.Document;
import org.jdom.Element;
import org.jdom.Attribute;

import java.util.List;

@SuppressWarnings({"unchecked"})
public class TestRunResultBuilder {

    public TestRunResult build(Document document) {
        TestRunResult result = new TestRunResult();
        Element root = document.getRootElement();

        Attribute urlAttribute = root.getAttribute("url");
        if (urlAttribute != null) {
            result.setUrl(urlAttribute.getValue());
        }
        
        Element propertiesElement = root.getChild("properties");
        if (propertiesElement != null)
            updateWithProperties(result, propertiesElement.getChildren());
        updateWithBrowserResults(document, result);

        return result;
    }

    private void updateWithBrowserResults(Document document, TestRunResult result) {
        BrowserResultBuilder browserBuilder = new BrowserResultBuilder();
        List<Element> children = document.getRootElement().getChildren("browserResult");
        for (Element element : children) {
            BrowserResult browserResult = browserBuilder.build(element);
            result.addBrowserResult(browserResult);
        }
    }

    private void updateWithProperties(TestRunResult result, List<Element> properties) {
        for (Element propertyElement : properties) {
            String name = propertyElement.getAttribute("name").getValue();
            String value = propertyElement.getAttribute("value").getValue();
            if (name.equals("os"))
                result.setOsName(value);
            else if (name.equals("ipAddress"))
                result.setIpAddress(value);
            else if (name.equals("hostname"))
                result.setHostname(value);
        }
    }

}
