<?php

defined('BASEPATH') or exit('No direct script access allowed');

/*
Module Name: Perfex CRM Email Builder
Module URI: https://codecanyon.net/item/drag-and-drop-perfex-crm-email-builder/25269927
Author: Ion Prodan
Author URI: https://yon.fun?utm_source=perfex-module
Description: Beautiful e-mail templates, with no design experience needed.
Version: 2.0.1
Requires at least: 2.4.*
*/

define('EMAIL_BUILDER_MODULE_NAME', 'perfex_email_builder');
define('EMAIL_BUILDER_NGB_FOLDER', 'em');

hooks()->add_action('admin_init', 'email_builder_init_menu_items');
hooks()->add_action('before_tickets_email_templates', 'before_tickets_email_templates');
hooks()->add_filter('module_' . EMAIL_BUILDER_MODULE_NAME . '_action_links', 'email_builder_setup_action_links');

// hooks set filter before_parse_email_template_message
// Later I need to implement the hooks
// hooks()->apply_filters('after_parse_perfex_email_builder_template_message', $template);
hooks()->add_filter('after_parse_email_template_message', 'before_parse_email_template_message', 0);
function before_parse_email_template_message($template) {
    $CI = &get_instance();
    
    if (!$CI->input->post('email_template_custom')) {        
        $CI->db->where('emailtemplateid', $template->emailtemplateid);
        $savedTemplate = $CI->db->get(db_prefix() . '_perfex_email_builder')->row();

        // Remove default insert track code filter
        hooks()->remove_filter('after_parse_email_template_message', 'email_tracking_inject_in_body');
        $template->has_tracking = in_array($template->slug, get_available_tracking_templates_slugs()) && $template->tmp_id;

        if ($savedTemplate) {
            // Add tracker code into body
            if ($template->has_tracking) {                
                $doc = new DOMDocument();
                $doc->loadHTML(html_entity_decode($savedTemplate->template));
    
                $trackImg = $doc->createElement('img');
                $trackImg->setAttribute("src", site_url('check_emails/track/' . $template->tmp_id));
                $trackImg->setAttribute("alt", "");
                $trackImg->setAttribute("width", "1");
                $trackImg->setAttribute("height", "1");
                $trackImg->setAttribute("border", "0");
    
                $body = $doc->getElementsByTagName('body')->item(0);
                $body->appendChild($trackImg);
                
                $template->message = $doc->saveHTML();
            } else {
                $template->message = html_entity_decode($savedTemplate->template);
            }
            $template->plaintext = 0;
        } else {
            if ($template->has_tracking) {
                $template->message .= '<img src="' . site_url('check_emails/track/' . $template->tmp_id) . '" alt="" width="1" height="1" border="0">';
            }
            $template->message = get_option('old_email_header') . $template->message . get_option('old_email_footer');
        }
    }

    return hooks()->apply_filters('after_parse_perfex_email_builder_template_message', $template);
}

function perfex_email_builder_head_styles() {
    $builderAssetsPath = module_dir_url(EMAIL_BUILDER_MODULE_NAME, 'assets/' . EMAIL_BUILDER_NGB_FOLDER);

    echo '<base href="' . $builderAssetsPath . '/">' . PHP_EOL;
    echo '<link href="//fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />' . PHP_EOL;
    echo '<link href="' . $builderAssetsPath . '/styles.css" rel="stylesheet">' . PHP_EOL;
}
function perfex_email_builder_footer_scripts() {
    $builderAssetsPath = module_dir_url(EMAIL_BUILDER_MODULE_NAME, 'assets/' . EMAIL_BUILDER_NGB_FOLDER);
    
    echo '<script data-cfasync="false" src="' . $builderAssetsPath . '/runtime-es2015.js?v=2.0.2" type="module"></script>' . PHP_EOL;
    echo '<script data-cfasync="false" src="' . $builderAssetsPath . '/runtime-es5.js?v=2.0.2" nomodule defer></script>' . PHP_EOL;
    echo '<script data-cfasync="false" src="' . $builderAssetsPath . '/polyfills-es2015.js?v=2.0.2" type="module"></script>' . PHP_EOL;
    echo '<script data-cfasync="false" src="' . $builderAssetsPath . '/polyfills-es5.js?v=2.0.2" nomodule defer></script>' . PHP_EOL;
    echo '<script data-cfasync="false" src="' . $builderAssetsPath . '/vendor-es2015.js?v=2.0.2" type="module"></script>' . PHP_EOL;
    echo '<script data-cfasync="false" src="' . $builderAssetsPath . '/vendor-es5.js?v=2.0.2" nomodule defer></script>' . PHP_EOL;
    echo '<script data-cfasync="false" src="' . $builderAssetsPath . '/main-es2015.js?v=2.0.2" type="module"></script>' . PHP_EOL;
    echo '<script data-cfasync="false" src="' . $builderAssetsPath . '/main-es5.js?v=2.0.2" nomodule defer></script>' . PHP_EOL;
}

/**
* Register language files, must be registered if the module is using languages
*/
register_language_files(EMAIL_BUILDER_MODULE_NAME, [EMAIL_BUILDER_MODULE_NAME]);

function email_builder_init_menu_items() {
    $CI = &get_instance();
    $CI->app_scripts->add('email-builder-js', module_dir_url(EMAIL_BUILDER_MODULE_NAME, 'assets/js/simple-fns.js'));

    if (has_permission(EMAIL_BUILDER_MODULE_NAME, '', 'view')) {
        $CI->app_menu->add_setup_menu_item(EMAIL_BUILDER_MODULE_NAME.'-menu', [
            'name'     => _l(EMAIL_BUILDER_MODULE_NAME),
            'collapse' => true,
            'position' => 35,
        ]);

        $CI->app_menu->add_setup_children_item(EMAIL_BUILDER_MODULE_NAME.'-menu', [
            'slug'     => 'edit_an_email_template', // Required ID/slug UNIQUE for the child menu
            'name'     => _l('edit_an_email_template'), // The name if the item
            'href'     => admin_url(EMAIL_BUILDER_MODULE_NAME), // URL of the item
        ]);

        $CI->app_menu->add_setup_children_item(EMAIL_BUILDER_MODULE_NAME.'-menu', [
            'slug'     => EMAIL_BUILDER_MODULE_NAME . '_options', // Required ID/slug UNIQUE for the child menu
            'name'     => _l(EMAIL_BUILDER_MODULE_NAME . '_options'), // The name if the item
            'href'     => admin_url(EMAIL_BUILDER_MODULE_NAME . '/options'), // URL of the item
        ]);
    }
}

function before_tickets_email_templates() {
    echo '<div class="col-md-8 col-md-offset-2 col-xs-12 col-xs-offset-0 text-center"><div class="alert alert-warning">' . _l('email_templates_top_alert') . '</div></div>';
}

/**
* Add additional settings for this module in the module list area
* @param  array $actions current actions
* @return array
*/
function email_builder_setup_action_links($actions) {
    $actions[] = '<a href="' . admin_url(EMAIL_BUILDER_MODULE_NAME) . '">' . _l(EMAIL_BUILDER_MODULE_NAME) . '</a>';
    return $actions;
}

/**
* Register activation module hook
*/
register_activation_hook(EMAIL_BUILDER_MODULE_NAME, 'email_builder_activation_hook');
function email_builder_activation_hook() {
    $CI = &get_instance();
    require_once(__DIR__ . '/install.php');
}

/**
 * Return old options on uninstall
 */
register_deactivation_hook(EMAIL_BUILDER_MODULE_NAME, 'email_builder_deactivation_hook');
function email_builder_deactivation_hook() {
    update_option('email_header', get_option('old_email_header'));
    update_option('email_footer', get_option('old_email_footer'));
}

/**
 * Delete all email builder options on uninstall
 */
register_uninstall_hook(EMAIL_BUILDER_MODULE_NAME, 'email_builder_uninstall_hook');
function email_builder_uninstall_hook() {
    delete_option('old_email_header');
    delete_option('old_email_footer');
    delete_option(EMAIL_BUILDER_MODULE_NAME . '_default_media_folder');
}