<?php

defined('BASEPATH') or exit('No direct script access allowed');

class Perfex_email_builder extends AdminController {

    public function __construct() {
        parent::__construct();
        if (!has_permission('email_templates', '', 'view')) {
            access_denied('email_templates');
        }
        $this->load->model('emailBuilder_model');
        $this->ci = &get_instance();
    }

    protected function json_output($data) {
        return $this->output->set_content_type('application/json')->set_output(json_encode($data));
    }

    public function index() {
        if (!has_permission('email_templates', '', 'view')) {
            access_denied('email_templates');
        }

        $active_language = get_option('active_language');

        $data['title'] = _l(EMAIL_BUILDER_MODULE_NAME);
        // $data['templates'] = $this->emailBuilder_model->getAllTemplates(
        //   ['language' => $active_language],
        //   ['emailtemplateid', 'type', 'name', 'subject', 'fromname', 'active']
        // );
        $data['languages'] = $this->emailBuilder_model->getEmailLanguages();
        $data['active_language'] = $active_language;

        $merge_fields = [];
        foreach ($this->app_merge_fields->all() as $val) {
            foreach($val as $type => $fields) {
                foreach($fields as $key => $value) {
                    unset($value['format']);
                    unset($value['templates']);
                    unset($value['available']);
                    $value['type'] = $type;
                    $merge_fields[] = $value;
                }
            }
        }

        $data['merge_fields'] = $merge_fields;

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

    public function getEmailTemplate() {
        $data = $this->emailBuilder_model->getEmailTemplate($this->input->get('emailtemplateid'));
        return $this->json_output($data);
    }

    public function getTemplate() {
        $data = $this->emailBuilder_model->getEmailObject($this->input->get('emailtemplateid'));
        return $this->json_output($data);
    }

    public function templates() {
        $data = $this->emailBuilder_model->getAllTemplates(
          ['language' => $this->input->get('language')],
          ['emailtemplateid', 'type', 'name', 'subject', 'active', 'fromname']
        );
        return $this->json_output($data);
    }

    public function update() {
      if (!has_permission('email_templates', '', 'edit')) {
        access_denied('email_templates');
      }
      if ($this->input->post() && $this->input->post('emailtemplateid') && $this->input->post('emailObject')) {
          $data = $this->input->post();
          $data['template'] = $this->input->post('template', false);
          $data['emailObject'] = $this->input->post('emailObject', false);
          $success = $this->emailBuilder_model->update($data);
          return $this->json_output(['success' => $success]);
      }
    }

    public function changeActiveStatus() {
      if (!has_permission('email_templates', '', 'edit')) {
        access_denied('email_templates');
      }
      if (!($updates = $this->input->post())) {
        $success = false;
      } else {
        $success = $this->emailBuilder_model->updateActiveStatus($updates);
      }
      return $this->json_output(['success' => $success]);
    }

    public function updateDetails() {
      if (!has_permission('email_templates', '', 'edit')) {
        access_denied('email_templates');
      }
      $updates = [];
      if (!($updates = $this->input->post())) {
        $success = false;
      } else {
        $success = $this->emailBuilder_model->updateDetails($updates);
        unset($updates['emailtemplateid']);
      }
      return $this->json_output(['success' => $success, 'updates' => $updates]);
    }

    public function revertTemplate($id) {
      $success = $this->emailBuilder_model->removeEditedEmail($id);
      if ($success) {
        $data = $this->emailBuilder_model->getEmailObject($id);
        return $this->json_output($data);
      }
      return $this->json_output(['$success' => $success]);
    }

    public function upload() {
        $this->load->helper('path');
        $media_folder = $this->app->get_media_folder();
        $defaultMediaFolder =  '/' . get_option(EMAIL_BUILDER_MODULE_NAME . '_default_media_folder') . '/';
        $mediaPath = FCPATH . $media_folder . $defaultMediaFolder;

        if (!is_dir($mediaPath)) {
            mkdir($mediaPath, 0755);
        }

        $config['upload_path'] = set_realpath($media_folder . $defaultMediaFolder, true);
        $config['allowed_types'] = 'jpg|jpeg|png|gif';
        $config['encrypt_name'] = TRUE;
        $config['max_size'] = (int)get_option('media_max_file_size_upload') * 1000;

        $this->load->library('upload', $config);

        if (!$this->upload->do_upload('image')) {
            $error = array('error' => $this->upload->display_errors('', ''), 'success' => false);
            return $this->json_output($error);
        } else {
            return $this->json_output(['success' => true, 'path' => site_url($media_folder) . $defaultMediaFolder . $this->upload->data('file_name')]);
        }
    }
}