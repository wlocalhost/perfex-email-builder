<?php defined('BASEPATH') or exit('No direct script access allowed'); ?>

<?php init_head(); ?>

<script>
    window.NGB = {
      baseUrl: "<?php echo base_url('/admin/' . EMAIL_BUILDER_MODULE_NAME) ?>",
      mount: 'templates',
      activeLanguage: '<?php echo $active_language; ?>',
      csrf: {
        token: '<?php echo $this->security->get_csrf_hash(); ?>',
        name: '<?php echo $this->security->get_csrf_token_name(); ?>'
      }
    }
</script>
<div id="wrapper">
    <?php hooks()->do_action('before_start_perfex_email_builder'); ?>
    <app-root></app-root>
    <div class="clearfix"></div>
    <?php hooks()->do_action('after_start_perfex_email_builder'); ?>
</div>
<?php init_tail(); ?>
</body>
</html>