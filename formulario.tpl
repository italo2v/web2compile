<!--
"""This file contains code for use with "Web2CompileCloud",
by Italo C. Brito, Geovane Mattos, Marina Vianna, Claudio C. Miceli available from labnet.nce.ufrj.br

Copyright 2015 - UFRJ
License: GNU GPLv3 http://www.gnu.org/licenses/gpl.html
"""

-->

<div align=center>
<b><font size=5 face=Arial >Web2compileCloud</b>
<p>
Login de usuarios
</p>
</font>

<font size=3 face=Arial>
<form action="" method="post">
Usuario: <input name="username" type="text" /> <br>
Senha: <input name="password" type="password" /> <br>
<input value="Login" type="submit" />
</form>
</div>
</font>
<script type="text/javascript">
	var path = window.location.pathname;
	var page = path.split("/").pop().split('.').pop();
	if(page == 'php'){
		route = 'route.php?action=';
	}else{
		route = '/';
	}
	document.getElementsByTagName("form")[0].setAttribute("action", route+"login");
</script>