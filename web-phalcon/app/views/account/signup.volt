{% extends "templates/index.volt" %}
{% block head %}
{{ stylesheet_link("css/graph.css") }}
{% endblock %}

{%block page_header %}
<div class="page-header">
    <h3>{{config.information.companyName}} network graph</h3>
</div>
{% endblock %}

{%block content%}
<div class="container-fluid">
    <section class="container">
		<div class="container-page">
	{{ form('class': 'register-form') }}
			<div class="col-md-6">
				<h3 class="dark-grey">Registration</h3>
        {{ flash.output() }}
				<div class="form-group col-lg-12">
					{{ form.label('username') }}
					{{ form.render('username') }}
          {{ form.messages('username') }}
				</div>

				<div class="form-group col-lg-6">
          {{ form.label('password') }}
          {{ form.render('password') }}
          {{ form.messages('password') }}
				</div>

				<div class="form-group col-lg-6">
          {{ form.label('confirmPassword') }}
          {{ form.render('confirmPassword') }}
          {{ form.messages('confirmPassword') }}
				</div>

				<div class="form-group col-lg-6">
          {{ form.label('email') }}
          {{ form.render('email') }}
          {{ form.messages('email') }}
      	</div>

				<div class="form-group col-lg-6">
          {{ form.label('confirmEmail') }}
          {{ form.render('confirmEmail') }}
          {{ form.messages('confirmEmail') }}
				</div>

				<div class="col-sm-6">
          {{ form.render('terms') }}
          Accept terms and conditions
          {{ form.messages('terms') }}
				</div>
			</div>

			<div class="col-md-6">
				<h3 class="dark-grey">Terms and Conditions</h3>
				<p>
					By clicking on "Register" you agree with NetGraphz2 licence.
				</p>
				<p>
					Software distributes under GNU General Public Licence v2
				</p>
				<p>
					NetGraphz2 is network monitoring project. It doesn't not collect any of your personal data: all information stored
          in application database.
				</p>
				<p>
				  Software doesn't send any of your data to other servers except deployed instance. 
				</p>
        {{ form.render('Register') }}
			</div>
      {{ form.render('csrf', ['name': this.security.getTokenKey(), 'value': this.security.getToken()]) }}
		  {{ form.messages('csrf') }}
		</form>
		</div>
	</section>
</div>
{% endblock %}
