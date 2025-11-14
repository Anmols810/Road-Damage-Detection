package servlets;

import javax.servlet.*;
import javax.servlet.http.*;
import java.io.*;
import org.w3c.dom.*;
import javax.xml.parsers.*;
import javax.xml.transform.*;
import javax.xml.transform.dom.*;
import javax.xml.transform.stream.*;

public class VoteServlet extends HttpServlet {
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String voterId = request.getParameter("voterId");
        String candidate = request.getParameter("candidate");

        File file = new File("C:/OnlineVotingSystem/votes.xml");
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();

        try {
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc;
            Element root;

            if (!file.exists()) {
                doc = builder.newDocument();
                root = doc.createElement("votes");
                doc.appendChild(root);
            } else {
                doc = builder.parse(file);
                root = doc.getDocumentElement();
            }

            NodeList votes = root.getElementsByTagName("vote");
            for (int i = 0; i < votes.getLength(); i++) {
                Element vote = (Element) votes.item(i);
                if (vote.getAttribute("voterId").equals(voterId)) {
                    response.getWriter().println("You have already voted!");
                    return;
                }
            }

            Element vote = doc.createElement("vote");
            vote.setAttribute("voterId", voterId);
            vote.appendChild(doc.createTextNode(candidate));
            root.appendChild(vote);

            Transformer transformer = TransformerFactory.newInstance().newTransformer();
            Result output = new StreamResult(file);
            Source input = new DOMSource(doc);
            transformer.transform(input, output);

            response.sendRedirect("result.jsp");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
