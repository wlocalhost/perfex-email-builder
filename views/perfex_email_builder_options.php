<?php defined('BASEPATH') or exit('No direct script access allowed'); ?>

<?php init_head(); ?>
<div id="wrapper">
    <div class="content">
        <div class="row">
            <?php hooks()->do_action('before_options_perfex_email_builder'); ?>
            <div class="col-md-3">
                <ul class="nav navbar-pills navbar-pills-flat nav-tabs nav-stacked">
                    <li class="active"><a href="<?php echo admin_url(EMAIL_BUILDER_MODULE_NAME . '/options'); ?>"><?php echo _l('general'); ?></a></li>
                    <li><a href="<?php echo admin_url(EMAIL_BUILDER_MODULE_NAME . '/options?group=admin_code'); ?>" ><?php echo _l('inject_code_admin'); ?></a></li>
                    <li><a href="<?php echo admin_url(EMAIL_BUILDER_MODULE_NAME . '/options?group=client_code'); ?>" ><?php echo _l('inject_code_client'); ?></a></li>
                </ul>
            </div>
            <div class="col-md-9">
                <div class="panel_s">
                    <div class="panel-body">
                        <div class="tab-pane" role="tabpanel">
                            <div id="alert-info" style="display: none;" role="alert" class="alert alert-dismissible"> 
                                <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                <span class="alert-content"></span>
                            </div>
                            <?php $this->load->view($tab['view']) ?>
                        </div>
                    </div>
                </div>
            </div>
            <div class="clearfix"></div>
        </div>
    </div>
</div>
<?php init_tail(); ?>
</body>
</html>