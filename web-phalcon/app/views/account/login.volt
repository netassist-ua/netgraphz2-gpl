{% extends "templates/index.volt" %}
{% block head %}
{{ stylesheet_link("css/graph.css") }}
{% endblock %}

{%block page_header %}
<div class="page-header">
  <h3>{{config.information.companyName}} network graph</h3>
</div>
{% endblock %}
{%block content %}
<div id="loginbox" style="margin-top:50px;/* padding-top: 50px; */" class="mainbox col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2">
  <div class="panel panel-info">
    <div class="panel-heading">
      <div class="panel-title">Sign In</div>
      <div style="float:right; font-size: 80%; position: relative; top:-10px"><a href="#">Forgot password?</a></div>
    </div>

    <div style="padding-top:30px" class="panel-body">

      <div style="display:none" id="login-alert" class="alert alert-danger col-sm-12"></div>

      {{ form('class': 'form-horizontal') }}

        <div style="margin-bottom: 25px" class="input-group">
          <span class="input-group-addon"><i class="glyphicon glyphicon-user"></i></span>
          {{ form.render('login') }}
        </div>

        <div style="margin-bottom: 25px" class="input-group">
          <span class="input-group-addon"><i class="glyphicon glyphicon-lock"></i></span>
          {{ form.render('password') }}
        </div>



        <div class="input-group">
          <div class="checkbox">
            <label>
              {{ form.render('remember') }} Remember me
            </label>
          </div>
        </div>


        <div style="margin-top:10px" class="form-group">
          <!-- Button -->

          <div class="col-sm-12 controls">
            {{ form.render('Sign In') }}
          </div>
        </div>

        {{ form.render('csrf', ['name': this.security.getTokenKey(), 'value': this.security.getToken()]) }}
        
        {% if config.information.openSignUp %}
        <div class="form-group">
          <div class="col-md-12 control">
            <div style="border-top: 1px solid#888; padding-top:15px; font-size:85%">
              Don't have an account!
              {{ link_to("Account/Register", "Sign Up Here") }}
            </div>
          </div>
        </div>
        {% endif %}

      </form>


    </div>
  </div>
</div>
{% endblock %}
