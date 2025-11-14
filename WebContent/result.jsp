<%@ page import="java.io.*, javax.xml.parsers.*, org.w3c.dom.*" %>
<html>
<head><title>Voting Result</title></head>
<body>
<h2>Voting Result</h2>
<%
    File file = new File("C:/OnlineVotingSystem/votes.xml");
    if (file.exists()) {
        DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
        DocumentBuilder db = dbf.newDocumentBuilder();
        Document doc = db.parse(file);

        int alice = 0, bob = 0, charlie = 0;
        NodeList votes = doc.getElementsByTagName("vote");

        for (int i = 0; i < votes.getLength(); i++) {
            String name = votes.item(i).getTextContent();
            if (name.equals("Alice")) alice++;
            else if (name.equals("Bob")) bob++;
            else if (name.equals("Charlie")) charlie++;
        }
%>
<ul>
  <li>Alice: <%= alice %> votes</li>
  <li>Bob: <%= bob %> votes</li>
  <li>Charlie: <%= charlie %> votes</li>
</ul>
<%
    } else {
        out.println("No votes yet!");
    }
%>
</body>
</html>
