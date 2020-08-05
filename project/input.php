<?php

$data = file_get_contents('php://input');
$first = "firstname";
$second = "lastname";

$jsonObj = json_decode($data);

$myFile = fopen('results/' . $jsonObj->$first . '_' . $jsonObj->$second . '_' . time() . '.json', 'w');
fwrite($myFile, $data);
fclose($myFile);
