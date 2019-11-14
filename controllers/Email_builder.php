<?php

defined('BASEPATH') or exit('No direct script access allowed');

class Email_builder extends AdminController {
    public function __construct() {
        parent::__construct();

        if (!has_permission('email_templates', '', 'view')) {
            access_denied('email_templates');
        } else {
            $this->load->model('emails_model');
        }
    }

    protected function json($data) {
        return $this->output->set_content_type('application/json')->set_output(json_encode($data));
    }

    public function index() {
        if (!has_permission('email_templates', '', 'view')) {
            access_denied('email_templates');
        }
        $data['title'] = _l('email_builder');
        $data['css_files'] = glob(module_dir_path('email_builder', 'assets/perfex-email-builder/*.css'));
        // $data['js_files'] = glob(module_dir_path('email_builder', 'assets/perfex-email-builder/*.js'));
        $this->load->view('email_builder', $data);
    }

    public function templates($type = 'staff', $language = 'english') {
        $data = $this->emails_model->get([
            'type'     => $type,
            'language' => $language,
        ]);
        return $this->json($data);
    }
}