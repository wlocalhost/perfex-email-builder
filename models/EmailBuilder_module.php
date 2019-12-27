<?php

defined('BASEPATH') or exit('No direct script access allowed');

class EmailBuilder_module extends App_Model {

    public function __construct()
    {
        parent::__construct();
        $this->emailTplsTable = db_prefix() . 'emailtemplates';
        $this->emailBuilderTable = db_prefix() . '_perfex_email_builder';
        $this->load->model('emails_model');
    }

    public function get(array $where = []) {
        $tpl = $this->emails_model->get($where, 'row');
        if ($tpl->emailtemplateid) {
            $this->db->where('emailtemplateid', $tpl->emailtemplateid);
            $savedTplObject = $this->db->get($this->emailBuilderTable)->row();
            if ($savedTplObject) {
                $tpl->emailObject = json_decode($savedTplObject->emailObject);
            }
        }
        return $tpl;
    }

    public function getAll(array $where = [], array $select = []) {
        $this->db->where($where);
        $this->db->select($select);
        return $this->db->get(db_prefix() . 'emailtemplates')->result_array();
        // return $this->emails_model->get($where, 'result_array');
    }

    public function update(array $data) {
        $_data             = [];
        $_data['fromname'] = $data['fromname'];
        $_data['subject']  = $data['subject'];

        $this->db->where('emailtemplateid', $data['emailtemplateid']);
        if ($this->db->update($this->emailTplsTable, $_data)) {
            $emailObject = json_encode(json_decode(stripslashes($data['emailObject']), true));
            $template = htmlspecialchars($data['htmlTemplate']);

            $this->db->where('emailtemplateid', $data['emailtemplateid']);
            if ($this->db->get($this->emailBuilderTable)->row()) {
                $this->db->where('emailtemplateid', $data['emailtemplateid']);
                $success = $this->db->update($this->emailBuilderTable, ['emailObject' => $emailObject, 'template' => $template]);
            } else {
                $this->db->where('emailtemplateid', $data['emailtemplateid']);
                $success = $this->db->insert($this->emailBuilderTable, ['emailObject' => $emailObject, 'template' => $template, 'emailtemplateid' => $data['emailtemplateid']]);
            }
            return $success;
        }
    }

    public function send_email_template($template_slug, $email, $merge_fields, $ticketid = '', $cc = '') {
        return $this->emails_model->send_email_template($template_slug, $email, $merge_fields, $ticketid, $cc);
    }
}