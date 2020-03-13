<?php defined('BASEPATH') or exit('No direct script access allowed'); ?>

<?php init_head(); ?>
<div id="wrapper">
    <?php hooks()->do_action('before_start_perfex_email_builder'); ?>
    <app-root
        data-mount="templates"
        data-languages='<?php echo json_encode($languages); ?>'
        data-active-language='<?php echo $active_language; ?>'
        data-merge-fields='<?php echo json_encode($merge_fields); ?>'
        data-api-base="<?php echo base_url('/admin/' . EMAIL_BUILDER_MODULE_NAME) ?>"
        data-csrf-token="<?php echo $this->security->get_csrf_hash(); ?>"
        data-csrf-name="<?php echo $this->security->get_csrf_token_name(); ?>">
    </app-root>
    <div class="clearfix"></div>
    <?php hooks()->do_action('after_start_perfex_email_builder'); ?>
</div>
<?php init_tail(); ?>
</body>
</html>