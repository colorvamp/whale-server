<article class="commit-node">
	<div class="avatar"><img src="http://gravatar.com/avatar/{%commitMailSum%}?s=60&r=pg&d=mm"/></div>
	<div class="wrapper">
		<h4>{%commitMessage%}</h4>
		<p>{%commitAuthor%} authored {%commitDateString%}</p>
		<div class="btn-group">
			<a class="btn mini" href="{%baseURL%}git/{%domainName%}/{%commitHash%}">
				<i class="icon-eye-open"></i> 
				View
			</a>
		</div>
	</div>
</article>
