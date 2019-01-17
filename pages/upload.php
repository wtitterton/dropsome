<?php
 header('Content-Type: application/json');

 $uploaded = array();

 if(!empty($_files['file']['name'][0]))
 {
 	foreach($_files['file']['name'] as $position => $name)
 	{
 			if(move_uploaded_file($_files['file']['tmp_name'][$position], '../uploads/' $name))
 			{
 				$uploaded[] = array(
 						'name' $name =>,
 				'file' => '../uploads/' . $name


 					);
 				
 			}
 }

 echo json_encode($uploaded);



