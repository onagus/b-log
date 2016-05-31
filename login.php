<?php 	
	$username = $_POST['username'];
	$password = $_POST['password']; 

	$names = array(
		'toshi' => 'toshi',
		'admin' => 'admin' 
        );

	$pw = array(
		'toshi' => 'password',
		'admin' => 'admin'
		);

	if ($_POST['password'] === $pw[$username] and $username === $names[$username]) {
		echo true;
	} 
	
	else {
		echo false;
	}
?>