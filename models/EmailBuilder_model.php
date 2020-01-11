<?php

defined('BASEPATH') or exit('No direct script access allowed');

class EmailBuilder_model extends App_Model {

    public function __construct()
    {
        parent::__construct();
        $this->emailTplsTable = db_prefix() . 'emailtemplates';
        $this->emailBuilderTable = db_prefix() . '_perfex_email_builder';
        $this->load->model('emails_model');
    }

    public function get(array $where = [], array $select = []) {
        $this->db->select($select);
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

    private function checkTableColumns(array $columns, string $table) {
        // Check if table has language column
        if (in_array('language', $columns) && !$this->db->field_exists('language', db_prefix() . $table)) {
            if ($key = array_search('language', $columns)) {
                unset($columns[$key]);
            }
        }
        return $columns;
    }

    public function getAll(array $where = [], array $select = [], string $table = 'emailtemplates', int $limit = 0, string $orderBy = '') {
        $this->db->select($select);
        $this->db->where($where);
        if ($limit > 0) {
            $this->db->limit($limit);
        }
        if ($orderBy) {
            $this->db->order_by($orderBy);
        }

        return $this->db->get(db_prefix() . $table)->result_array();
    }

    public function getEmailLanguages() {
        $languages = [];
        $this->db->select('language');
        $this->db->distinct();
        $query = $this->db->get($this->emailTplsTable);

        if ($query->num_rows() >= 1) {
            foreach ($query->result() as $row) {
               $languages[] = $row->language;
           }
        }

        return $languages;
    }


    public function getEmailTemplate(string $emailtemplateid) {

        $data = array('is_edited' => false);
        $this->db->where(['emailtemplateid' => $emailtemplateid]);
        $this->db->select('template');
        $query = $this->db->get($this->emailBuilderTable);

        if ($query->num_rows() >= 1) {
            $data['html'] = $query->row()->template;
            $data['is_edited'] = true;
        } else {
            $this->db->where(['emailtemplateid' => $emailtemplateid]);
            $this->db->select('message');
            $query = $this->db->get($this->emailTplsTable);
            $data['html'] = get_option('old_email_header') . $query->row()->message . get_option('old_email_footer');
        }

        return $data;
    }

    public function getEmailObject(string $emailtemplateid) {
        $this->db->select('emailObject');
        $this->db->where(['emailtemplateid' => $emailtemplateid]);
        return $this->db->get($this->emailBuilderTable)->row();
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