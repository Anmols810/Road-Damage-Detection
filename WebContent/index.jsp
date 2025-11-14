<%@ page language="java" %>
<html>
<head><title>Online Voting System</title></head>
<body>
<h2>Welcome to Online Voting</h2>
<form method="post" action="VoteServlet">
  Enter Voter ID: <input type="text" name="voterId"/><br/><br/>
  Select Candidate:<br/>
  <input type="radio" name="candidate" value="Alice"/> Alice<br/>
  <input type="radio" name="candidate" value="Bob"/> Bob<br/>
  <input type="radio" name="candidate" value="Charlie"/> Charlie<br/><br/>
  <input type="submit" value="Vote"/>
</form>
</body>
</html>
