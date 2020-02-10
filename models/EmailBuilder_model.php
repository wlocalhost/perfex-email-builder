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

    public function getAll(
        $where = [],
        array $select = [], 
        string $table = 'emailtemplates', 
        int $limit = 0, 
        string $orderBy = ''
    ) {
        $this->db->select($select);
        if ($where) {
            $this->db->where($where);
        }
        if ($limit > 0) {
            $this->db->limit($limit);
        }
        if ($orderBy) {
            $this->db->order_by($orderBy);
        }
        $items = $this->db->get(db_prefix() . $table)->result_array();
        $templates = [];

        foreach ($items as $item) {
            if (!isset($item['type'])) continue;
            $type = $item['type'];
            unset($item['type']);
            $templates[$type][] = $item;
        }
        return $templates;
    }

    public function getAllTemplates($where = [], array $select = []) {
        // $select[] = [`{$this->emailBuilderTable}'.updated_at`];
        $this->db->select($select);
        if ($where) {
            $this->db->where($where);
        }
        $items = $this->db->get($this->emailTplsTable)->result_array();

        $this->db->select(['emailtemplateid', 'updated_at']);
        $savedItems = $this->db->get($this->emailBuilderTable)->result_array();

        $templates = [];

        foreach ($items as $item) {
            if (!isset($item['type'])) continue;
            $type = $item['type'];
            unset($item['type']);
            $key = array_search($item['emailtemplateid'], array_column($savedItems, 'emailtemplateid'));
            if ($key) {
                $item['updated_at'] = $savedItems[$key]['updated_at'];
            }
            $templates[$type][] = $item;
        }
        return $templates;
    }

    public function getEmailLanguages() {
        $languages = [];
        $this->db->select('language');
        $this->db->where('language !=', get_option('active_language'));
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
            $data['html'] = html_entity_decode($query->row()->template);
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
        $query = $this->db->get($this->emailBuilderTable);

        if ($query->num_rows() >= 1) {
            $data['emailObject'] = json_decode($query->row()->emailObject);
            return $data;
        } else {
            $this->db->select(['message', 'subject']);
            $this->db->where(['emailtemplateid' => $emailtemplateid]);
            return $this->db->get($this->emailTplsTable)->row();
        }
    }

    public function update(array $data) {
        $emailObject = json_encode(json_decode($data['emailObject']));        
        $template = htmlspecialchars($data['template']);

        $this->db->where('emailtemplateid', $data['emailtemplateid']);
        if ($this->db->get($this->emailBuilderTable)->row()) {
            $this->db->where('emailtemplateid', $data['emailtemplateid']);
            $success = $this->db->update($this->emailBuilderTable, [
                'emailObject' => $emailObject, 
                'template' => $template
            ]);
        } else {
            $this->db->where('emailtemplateid', $data['emailtemplateid']);
            $success = $this->db->insert($this->emailBuilderTable, [
                'emailObject' => $emailObject, 
                'template' => $template, 
                'emailtemplateid' => $data['emailtemplateid']
            ]);
        }
        return $success;
    }

    public function updateActiveStatus(array $updates) {
        $templateId = $updates['emailtemplateid'];
        unset($updates['emailtemplateid']);

        if ($templateId) {
            $this->db->select(['slug']);
            $this->db->where('emailtemplateid', $templateId);
            $query = $this->db->get($this->emailTplsTable)->row();
            if ($query->slug) {
                $this->db->where('slug', $query->slug);
                return $this->db->update($this->emailTplsTable, $updates);
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    public function updateDetails(array $updates) {
        $templateId = $updates['emailtemplateid'];
        unset($updates['emailtemplateid']);

        if ($templateId) {
            $this->db->where('emailtemplateid', $templateId);
            return $this->db->update($this->emailTplsTable, $updates);
        } else {
            return false;
        }
    }

    public function removeEditedEmail($id) {
        return $this->db->where('emailtemplateid', $id)->delete($this->emailBuilderTable);
    }

    public function send_email_template($template_slug, $email, $merge_fields, $ticketid = '', $cc = '') {
        return $this->emails_model->send_email_template($template_slug, $email, $merge_fields, $ticketid, $cc);
    }
}