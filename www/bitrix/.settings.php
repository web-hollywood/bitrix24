<?php
return array (
'pull_s1' => 'BEGIN GENERATED PUSH SETTINGS. DON\'T DELETE COMMENT!!!!',
'pull' => Array(
    'value' =>  array(
        'path_to_listener' => 'http://#DOMAIN#/bitrix/sub/',
        'path_to_listener_secure' => 'https://#DOMAIN#/bitrix/sub/',
        'path_to_modern_listener' => 'http://#DOMAIN#/bitrix/sub/',
        'path_to_modern_listener_secure' => 'https://#DOMAIN#/bitrix/sub/',
        'path_to_mobile_listener' => 'http://#DOMAIN#:8893/bitrix/sub/',
        'path_to_mobile_listener_secure' => 'https://#DOMAIN#:8894/bitrix/sub/',
        'path_to_websocket' => 'ws://#DOMAIN#/bitrix/subws/',
        'path_to_websocket_secure' => 'wss://#DOMAIN#/bitrix/subws/',
        'path_to_publish' => 'http://empower.software:8895/bitrix/pub/',
        'path_to_publish_web' => 'http://#DOMAIN#/bitrix/rest/',
        'path_to_publish_web_secure' => 'https://#DOMAIN#/bitrix/rest/',
        'nginx_version' => '4',
        'nginx_command_per_hit' => '100',
        'nginx' => 'Y',
        'nginx_headers' => 'N',
        'push' => 'Y',
        'websocket' => 'Y',
        'signature_key' => 'HMvZpt5dTiy1LJpFPdpDju7CBEw7UL4rHIc71e3veTC9V3W3EAwkDQvHzIWtVFsX19QlGkRVXtT1hsQhJq12ZCxinrPdBPlMD6HMlS5FZQnGarIGOBSE2HUyPTPTfolZ',
        'signature_algo' => 'sha1',
        'guest' => 'N',
    ),
),
'pull_e1' => 'END GENERATED PUSH SETTINGS. DON\'T DELETE COMMENT!!!!',
  'utf_mode' =>
  array (
    'value' => true,
    'readonly' => true,
  ),
  'cache_flags' =>
  array (
    'value' =>
    array (
      'config_options' => 3600,
      'site_domain' => 3600,
    ),
    'readonly' => false,
  ),
  'cookies' =>
  array (
    'value' =>
    array (
      'secure' => false,
      'http_only' => true,
    ),
    'readonly' => false,
  ),
  'exception_handling' =>
  array (
    'value' =>
    array (
      'debug' => false,
      'handled_errors_types' => 4437,
      'exception_errors_types' => 4437,
      'ignore_silence' => false,
      'assertion_throws_exception' => true,
      'assertion_error_type' => 256,
      'log' => array (
          'settings' =>
          array (
            'file' => '/var/log/php/exceptions.log',
            'log_size' => 1000000,
        ),
      ),
    ),
    'readonly' => false,
  ),
  'crypto' => 
  array (
    'value' => 
    array (
        'crypto_key' => 'uq3m3sahlr8i1i3xoggnmhrbnrv1ddyx',
    ),
    'readonly' => true,
  ),
  'connections' =>
  array (
    'value' =>
    array (
      'default' =>
      array (
        'className' => '\\Bitrix\\Main\\DB\\MysqliConnection',
        'host' => 'localhost',
        'database' => 'sitemanager',
        'login'    => 'bitrix0',
        'password' => 'fF3tKz2&GDA]IRG7kPi4',
        'options' => 2,
      ),
    ),
    'readonly' => true,
  )
);