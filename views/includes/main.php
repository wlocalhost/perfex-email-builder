<?php echo form_open('', ['id' => 'saveEmailBuilderOptions']); ?>
    <div class="form-group">
        <label for="_default_media_folder"><?php echo _l('purchase_code'); ?></label>
        <input required type="text" name="perfex_email_builder_purchase_code" id="perfex_email_builder_purchase_code" value="<?php echo get_option('perfex_email_builder_purchase_code'); ?>" class="form-control" />
    </div>
    <div class="form-group">
        <label for="_default_media_folder"><?php echo _l('default_media_folder'); ?></label>
        <input required type="text" name="default_media_folder" id="_default_media_folder" value="<?php echo get_option(EMAIL_BUILDER_MODULE_NAME . '_default_media_folder'); ?>" class="form-control" />
    </div>
    <div class="form-group">
        <label for="old_email_header"><?php echo _l('old_email_header'); ?></label>
        <textarea required name="old_email_header" id="old_email_header" cols="30" rows="20" class="form-control">
            <?php echo get_option('old_email_header'); ?>
        </textarea>
    </div>
    <div class="form-group">
        <label for="old_email_footer"><?php echo _l('old_email_footer'); ?></label>
        <textarea required name="old_email_footer" id="old_email_footer" cols="30" rows="20" class="form-control">
            <?php echo get_option('old_email_footer'); ?>
        </textarea>
    </div>
    <div class="form-group">
        <input type="hidden" name="group" value="<?php echo $group; ?>">
        <button class="btn btn-primary" type="submit"><?php echo _l('save_general_options'); ?></button>
    </div>
</form>