<?php defined('BASEPATH') or exit('No direct script access allowed'); ?>

<?php init_head(); ?>
<div id="wrapper">
    <?php hooks()->do_action('before_start_perfex_email_builder'); ?>
    <app-root style="max-height: calc(100vh - 63px);"></app-root>
    <?php hooks()->do_action('after_start_perfex_email_builder'); ?>
</div>
<script>
    window.GlobalVariable = {
        API_BASE: "<?php echo base_url('/admin/' . EMAIL_BUILDER_MODULE_NAME) ?>",
        MERGE_FIELDS: <?php echo json_encode($available_merge_fields); ?>,
        CSRF: {
            name: "<?php echo $this->security->get_csrf_token_name(); ?>",
            token: "<?php echo $this->security->get_csrf_hash(); ?>"
        }
    }
</script>
<?php init_tail(); ?>
</body>
</html>