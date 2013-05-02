<?php
$conn_string = "host=192.168.80.128 port=5432 dbname=ogo user=postgres password=postgres connect_timeout=1";
$conn = pg_connect($conn_string);