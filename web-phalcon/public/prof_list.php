<?php
$path = '/tmp/xhprof/';
foreach(glob($path."*") as $file) {
   $tmp = pathinfo($file);
   echo "<a href=\"/xhprof_html/index.php?run={$tmp['filename']}&source={$tmp['extension']}\">{$tmp['filename']}</a><br/>";
}
?>
