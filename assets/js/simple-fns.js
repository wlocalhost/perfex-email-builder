function _saveEmailBuilderOptions(ev, form) {
  ev.preventDefault();
  var $_form = $(form);
  var $_alertInfo = $('#alert-info');
  var $_formData = $_form.serialize();

  $_form.find('input, textarea, button').prop('disabled', true);
  $.post($_form.attr('action'), $_formData, function(res) {
    $_alertInfo.addClass('alert-' + res.type);
    $_alertInfo.find('.alert-content').html(res.status);
    $_alertInfo.show();
    $_form.find('input, textarea, button').prop('disabled', false);
  });
}
