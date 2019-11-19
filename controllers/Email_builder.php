<?php

defined('BASEPATH') or exit('No direct script access allowed');

class Email_builder extends AdminController {

    public function __construct() {
        $config['csrf_regenerate'] = FALSE;
        parent::__construct();

        if (!has_permission('email_templates', '', 'view')) {
            access_denied('email_templates');
        }

        $this->load->model('emailBuilder_module');
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
        $data['title'] = _l('email_builder');
        $data['available_merge_fields'] = $this->app_merge_fields->all();
        // $data['css_files'] = glob(module_dir_path('email_builder', 'assets/perfex-email-builder/*.css'));
        // $data['js_files'] = glob(module_dir_path('email_builder', 'assets/perfex-email-builder/*.js'));
        $this->load->view('email_builder', $data);
    }

    public function templates() {
        $data = $this->emailBuilder_module->get(['type' => $this->input->get('type'), 'language' => $this->input->get('language')]);
        return $this->json_output($data);
    }

    public function update() {
        if ($this->input->post() && $this->input->post('emailtemplateid') && $this->input->post('emailObject')) {
            if (!has_permission('email_templates', '', 'edit')) {
                access_denied('email_templates');
            }
            $success = $this->emailBuilder_module->update($this->input->post());
            return $this->json_output(['success' => $success]);
        }
    }
}