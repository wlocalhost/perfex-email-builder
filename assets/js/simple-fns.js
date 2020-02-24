(function($) {
  'use strict';
  $(document).ready(function() {
    $('form#saveEmailBuilderOptions').on('submit', function(ev) {
      ev.preventDefault();
      var $_form = $(this);
      var $_alertInfo = $('#alert-info');
      var $_formData = $_form.serialize();

      $_form.find('input, textarea, button').prop('disabled', true);
      $.post($_form.attr('action'), $_formData, function(res) {
        $_alertInfo.addClass('alert-' + res.type);
        $_alertInfo.find('.alert-content').html(res.status);
        $_alertInfo.show();
        $_form.find('input, textarea, button').prop('disabled', false);
      });
    });

    var clientModal = $('#contract_send_to_client_modal');

    if (clientModal) {
      clientModal.find('#attach_pdf').parent().after('<div class="checkbox checkbox-primary"> <input type="checkbox" name="include_default_template" id="include_default_template"> <label for="include_default_template">Send default template <small>by Perfex Email Builder</small></label> </div>')
     
  
      $('#include_default_template').on('change', function () {
        var textarea = $('textarea#email_template_custom');
        clientModal.find('h5.bold, h5.bold + hr, [app-field-wrapper="email_template_custom"]')[this.checked ? 'hide' : 'show']();
  
        if (this.checked) {
          // textarea.parent().attr('app-field-wrapper', 'no_email_template_custom')
          textarea.attr('name', 'no_email_template_custom')
        } else {
          // textarea.parent().attr('app-field-wrapper', 'email_template_custom')
          textarea.attr('name', 'email_template_custom')
        }
      })
    }

  });
})(jQuery);
