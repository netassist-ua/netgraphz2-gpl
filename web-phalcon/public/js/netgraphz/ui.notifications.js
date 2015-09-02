var netgraphz = netgraphz || {};
netgraphz.ui = netgraphz.ui || {};

netgraphz.ui.notifications = (function(ui, tools, toastr, notify){
  var use_desktop = false;
  var module = {};
  var isIE = false;

  var defaults = {
    'tryUseDesktop': true,
    'showTime': 900,
    'sounds': {
      'info': '/sounds/KDE-Sys-App-Message.ogg',
      'warning': '/sounds/KDE-Sys-Warning.ogg',
      'error': '/sounds/KDE-Sys-App-Error.ogg',
      'ok': '/sounds/KDE-Sys-App-Positive.ogg'
    },
    'toastr': {
      'closeButton': true,
      'debug': false,
      'newestOnTop': false,
      'progressBar': false,
      'positionClass': 'toast-bottom-left',
      'preventDuplicates': false,
      'onclick': null,
      'hideDuration': 1000,
      'timeOut': 5000,
      'extendedTimeOut': 1000,
      'showEasing': 'swing',
      'hideEasing': 'linear',
      'showMethod': 'fadeIn',
      'hideMethod': 'fadeOut'
    }
  };


  var sounds = {};
  var snd = Object.freeze({
      SND_INFO: 0,
      SND_WARNING: 1,
      SND_ERROR: 2,
      SND_OK: 3
  });

  var settings = defaults;
  settings.toastr.showDuration = settings.showTime;
  toastr.options = settings.toastr;

  try {
    isIE = (win.external && win.external.msIsSiteMode() !== undefined);
  }
  catch (e) {}


  module.init = function(config){
    settings = tools.extend(defaults, config, true); //deep extend
    settings.toastr.showDuration = settings.showTime;
    toastr.options = settings.toastr;

    sounds[snd.SND_INFO] = new Audio(settings.sounds.info);
    sounds[snd.SND_WARNING] = new Audio(settings.sounds.warning);
    sounds[snd.SND_ERROR] = new Audio(settings.sounds.error);
    sounds[snd.SND_OK] = new Audio(settings.sounds.ok);
    if(!settings.tryUseDesktop)
      return;
    if(notify.isSupported){
      if(isIE){
        use_desktop = false;
        return;
      }
      var perm = notify.permissionLevel();
      switch(perm){
        case notify.PERMISSION_DENIED:
        use_desktop = false;
        case notify.PERMISSION_DEFAULT:
        notify.requestPermission(function(){
          if(notify.PERMISSION_GRANTED)
          use_desktop = true;
          return;
        });
        break;
        case notify.PERMISSION_GRANTED:
        use_desktop = true;
        notify.config({pageVisibility: false, autoClose: 5000});
        break;
        default:
        use_desktop = false;
      }
    }
    else {
      use_desktop = false;
    }

  };

  module.sendError = function(title, text){
    sounds[snd.SND_ERROR].play();
    if(use_desktop){
      notify.createNotification(title, {
          body: text,
          icon: "/ico/error.png"
      });
    }
    else {
        toastr["error"](title, text);
    }
  };

  module.sendSuccess = function(title, text){
    sounds[snd.SND_OK].play();
    if(use_desktop){
      notify.createNotification(title, {
          body: text,
          icon: "/ico/icinga.png"
      });
    }
    else {
        toastr["success"](title, text);
    }
  };

  module.sendWarning = function(title, text){
      sounds[snd.SND_WARNING].play();
      if(use_desktop){
        notify.createNotification(title, {
            body: text,
            icon: "/ico/warning.png"
        });
      }
      else {
          toastr["warning"](title, text);
      }
  };

  module.send = function(title, text){
    sounds[snd.SND_INFO].play();
    if(use_desktop){
      notify.createNotification(title, {
        body: text,
        icon: "/ico/info.png"
      });
    }
    else {
      toastr["info"](title, text);
    }
  };

  return module;
})(netgraphz.ui, netgraphz.tools, toastr, notify);
