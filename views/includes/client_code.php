<?php echo form_open('', ['id' => 'saveEmailBuilderOptions']); ?>
    <div class="form-group">
        <label for="perfex_email_builder_client_custom_css"><?php echo _l('email_builder_client_custom_css'); ?></label>
        <textarea name="perfex_email_builder_client_custom_css" id="perfex_email_builder_client_custom_css" cols="30" rows="20" class="form-control">
            <?php echo get_option('perfex_email_builder_client_custom_css'); ?>
        </textarea>
    </div>
    <div class="form-group">
        <label for="old_email_footer"><?php echo _l('email_builder_client_custom_js'); ?></label>
        <textarea name="perfex_email_builder_client_custom_js" id="perfex_email_builder_client_custom_js" cols="30" rows="20" class="form-control">
            <?php echo get_option('perfex_email_builder_client_custom_js'); ?>
        </textarea>
    </div>
    <div class="form-group">
        <input type="hidden" name="group" value="<?php echo $group; ?>">
        <button class="btn btn-primary" type="submit"><?php echo _l('save'); ?></button>
    </div>
</form>