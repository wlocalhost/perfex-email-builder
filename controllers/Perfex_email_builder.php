<?php

defined('BASEPATH') or exit('No direct script access allowed');

class Perfex_email_builder extends AdminController {

    public function __construct() {
        parent::__construct();

        if (!has_permission('email_templates', '', 'view')) {
            access_denied('email_templates');
        }

        $this->load->model('emailBuilder_module');
        // $this->load->library('upload');
    }

    protected function json_output($data) {
//        if ($this->input->is_ajax_request()) {
        return $this->output->set_content_type('application/json')->set_output(json_encode($data));
//        } else {
//            return $this->output->set_content_type('text/html')->set_output(json_encode($data));
//        }
    }

    public function index() {
        if (!has_permission('email_templates', '', 'view')) {
            access_denied('email_templates');
        }
        $data['title'] = _l(EMAIL_BUILDER_MODULE_NAME);
        $data['available_merge_fields'] = $this->app_merge_fields->all();

        // $builderAssetsPath = module_dir_url(EMAIL_BUILDER_MODULE_NAME, 'assets/' . EMAIL_BUILDER_NGB_FOLDER);

        hooks()->add_action('app_admin_head', 'perfex_email_builder_head_styles');
        hooks()->add_action('app_admin_footer', 'perfex_email_builder_footer_scripts');

        $this->load->view(EMAIL_BUILDER_MODULE_NAME, $data);
    }

    public function options() {
        if (!has_permission('email_templates', '', 'view')) {
            access_denied('email_templates');
        }
        $data['title'] = _l(EMAIL_BUILDER_MODULE_NAME . '_options');
        if (!$this->input->is_ajax_request()) {
            $this->load->view(EMAIL_BUILDER_MODULE_NAME . '_options', $data);
        } else {
            $options = $this->input->post(null, false);

            update_option(EMAIL_BUILDER_MODULE_NAME . '_default_media_folder', $this->input->post('default_media_folder'));
            update_option('old_email_header', html_entity_decode($options['old_email_header']));
            update_option('old_email_footer', html_entity_decode($options['old_email_footer']));

            return $this->json_output(['type' => 'success', 'status' => _l('options_updated')]);
        }
    }

    public function templates() {
        $data = $this->emailBuilder_module->get(['type' => $this->input->get('type'), 'language' => $this->input->get('language')]);
        return $this->json_output($data);
    }

    public function update() {
        // return $this->json_output(['template' => $this->input->post('htmlTemplate', false)]);

        if ($this->input->post() && $this->input->post('emailtemplateid') && $this->input->post('emailObject')) {
            if (!has_permission('email_templates', '', 'edit')) {
                access_denied('email_templates');
            }
            
            $data = $this->input->post();
            $data['htmlTemplate'] = $this->input->post('htmlTemplate', false);

            // return $this->json_output(['data' => $data]);

            $success = $this->emailBuilder_module->update($data);
            return $this->json_output(['success' => $success]);
        }
    }

    public function upload() {
        $this->load->helper('path');
        // $config['upload_path'] = module_dir_path('email_builder', 'assets/upload');
        $media_folder = $this->app->get_media_folder();
        $defaultMediaFolder =  '/' . get_option(EMAIL_BUILDER_MODULE_NAME . '_default_media_folder') . '/';
        $mediaPath    = FCPATH . $media_folder . $defaultMediaFolder;

        if (!is_dir($mediaPath)) {
            mkdir($mediaPath, 0755);
        }

        $config['upload_path'] = set_realpath($media_folder . $defaultMediaFolder, true);
        $config['allowed_types'] = 'jpg|jpeg|png|gif';
        $config['encrypt_name'] = TRUE;
        $config['max_size'] = (int)get_option('media_max_file_size_upload') * 1000;
        // $config['max_width'] = 1500;
        // $config['max_height'] = 1500;

        $this->load->library('upload', $config);

        if (!$this->upload->do_upload('image')) {
            $error = array('error' => $this->upload->display_errors('', ''), 'success' => false);
            // $error['URL'] = site_url($media_folder) . '/';
            // $error['max_size'] = $config['max_size'];
            return $this->json_output($error);
        } else {
            // $data = array('image_metadata' => $this->upload->data());
            // $data['URL'] = site_url($media_folder) . '/';

            // return $this->json_output($data);
            return $this->json_output(['success' => true, 'path' => site_url($media_folder) . $defaultMediaFolder . $this->upload->data('file_name')]);
        }
    }
}