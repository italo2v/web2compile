/*
"""This file contains code for use with "Web2CompileCloud",
by Italo C. Brito, Geovane Mattos, Marina Vianna, Claudio C. Miceli available from labnet.nce.ufrj.br

Copyright 2015 - UFRJ
License: GNU GPLv3 http://www.gnu.org/licenses/gpl.html
"""
*/


var changed = 0;
var editor = undefined;
var tinyos_dir = "../../tinyos-2.1.2/apps/Blink/"
//var cooja_dir = "contiki-2.7/tools/cooja/";

//adjusts the size os components, starts the ace editor and dropzone, open and close dropzone button
$( document ).ready(function() {
	
	/* counts the number of lines in log of TOSSIM and shows in console
	shellexec(function(output){
		$('#Console-log').html(output);
		openConsole();
	}, 'wc -l log.txt', 'local');*/
	
	$('#getStatus').click(
		function(){
			//submitExperiment();
			id = $('#experimentId').val();
			statusExperiment(id);
		}
	);
	
	$('#compile').click(
		function(){
			compileMicaz();
		}
	);

	$('#openCooja').click(
		function(){
			openCooja();
		}
	);

	//detect language php or python
	var path = window.location.pathname;
	var page = path.split("/").pop().split('.').pop();
	if(page == 'php'){
		route = 'route.php?action=';
	}else{
		route = '/';
	}
	
	//dropzone to drag'n drop
	if(document.getElementById('my-awesome-dropzone')){
		$('#my-awesome-dropzone').get(0).setAttribute('action', route+'upload');
		$("div#my-awesome-dropzone").dropzone({ url: route+"upload" });
		Dropzone.options.myAwesomeDropzone = {
			paramName: "upload",
			maxFilesize: 2, // MB
			uploadultiple: true,
			addRemoveLinks: "dictCancelUploadConfirmation",
			removedfile: function(file){
				if( $("span:contains('"+file.name+"')").parent().parent().parent().find('.dz-error-message').find('span').html() == '')
					del(file.name);
			},
			acceptedFiles: ".py,.c,.nc,.h",
			dictInvalidFileType: 'Please, check the file(s). The extensios allowed are: *.nc, *.c, *.py, *.h!',
			init: function() {
				this.on("complete", function(file) {
					listFiles();
					$(".dz-message").css('display', 'none'); //hidding "Drop files here to upload"
				});
				/*this.on("sending", function(file) {
					for(i=0;i<this.files.length-1;i++){
						if(this.files[i].name == file.name){
							alerta('Error', 'File already uploaded!');
							split = this.files[i].name.split('.');
							ext = split[split.length];
							this.files[i].name += '-copy';
						}
					}
			    });*/
				/*this.on("sending", function(file, xhr, formData) {
					split = file.name.split('.');
					ext = split[split.length-1];
					name = "";
					for(i=0;i<split.length-1;i++)
						name += split[i]+'.';
					name += '-copy.'+ext;
					file.name = name;
					formData = new formData();
					formData.append('upload', file);
				});*/
				/*this.on("removedfile", function(file) {
					listFiles();
					$("span:contains('"+file.name+"')").parent().parent().parent().remove(); //remove from list
					if ($('.dz-preview').html() == undefined)
						$(".dz-message").css('display', 'block'); //showing "Drop files here to upload"
				});*/
			  }
		};
	}

	h = window.innerHeight;
	topo = 8+28+5+30;
	if(document.getElementById('buttons'))
		topo += 42;
	dropzone = 10+2+76+20+2;
	consoleh = 190;
	h = h-topo;
	
	//adjusting the sizes os ace editor, list of files or experiments
	$('#console').css('display', 'none');
	$('#console').css('height', '150');
	$('#files').css('width', '100%');
	$('#files').css('height', h);
	$('#files').css('float', 'left');
	$('#experiments').css('height', h);
	$('#edit').css('width', '70%');
	$('#edit').css('float', 'right');
	$('#edit').css('height', h);
	$('#editor').css('height', h-40);
	$('#list').css('width', '100%');
	$('#maxsizelist').css('height', h-10);
	$('#edit').css('display', 'none');
	$('#my-awesome-dropzone').css('display', 'none');


	//ace editor
	if(document.getElementById('editor')){
		editor = ace.edit("editor");
		editor.setTheme("ace/theme/merbivore");
		editor.getSession().setMode("ace/mode/python");
		editor.setHighlightActiveLine(true);
		editor.getSession().on('change', function(e) {
    		changed = 1;
		});
	}
	
	//open and close dropzone button
	$('#openUpload').click(
		function(){
			if($('#my-awesome-dropzone').css('display') == 'none'){ //open
				h = h-dropzone;
				$('#edit').animate({ height: h }, 400 );
				$('#editor').animate({ height: h-40 }, 400 );
				$('#files').animate({ height: h }, 400 );
				$('#maxsizelist').animate({ height: h-10 }, 400 );
				$('#console').animate({ 'margin-top': h+20 }, 400 );
				$('#my-awesome-dropzone').css('display', 'block');
				$('#my-awesome-dropzone').css('height', '0px');
				$('#my-awesome-dropzone').css('min-height', '0px');
				$('#my-awesome-dropzone').css('margin', '10px 0 0 0');
				$('#my-awesome-dropzone').css('padding', '0');
				$('#my-awesome-dropzone').animate({ height: '100' }, 400 );
				$('#my-awesome-dropzone').animate({ padding: '0 20 20 20' }, 400 );
				jQuery(this).html('Close upload box');
			}else{ //close
				h += dropzone;
				$('#my-awesome-dropzone').animate({ height: '0' }, 400 );
				$('#my-awesome-dropzone').animate({ margin: '0' }, 400 );
				$('#edit').animate({ height: h }, 400 );
				$('#editor').animate({ height: h-40 }, 400 );
				$('#files').animate({ height: h }, 400 );
				$('#maxsizelist').animate({ height: h-10 }, 400 );
				$('#console').animate({ 'margin-top': h+20 }, 400 );
				jQuery(this).html('Open upload box');
				setTimeout( "$('#my-awesome-dropzone').css('display', 'none');",300 );
			}
		}
	);
	
	if(document.getElementById('files'))
		listFiles();
	else if(document.getElementById('experiments'))
		listExperiments();
});

//ask if you really wanto to delete the file
function deletar(filename){
	file_editing = $('#file_editing').html();
	if(file_editing == filename){
		if(changed == 1)
			confirma('Unsaved changes', 'Are you sure you want to delete the file '+filename+'? All the changes will be lost.', 'del("'+filename+'");hide();');
		else
			confirma('Delete File', 'Are you sure you want to delete the file '+filename+'? ', 'del("'+filename+'");hide();');
	}else
		confirma('Delete File', 'Are you sure you want to delete the file '+filename+'? ', 'del("'+filename+'");hide();');
}

//delete the file of the folder and refresh the list
function del(filename){
	var formData = new FormData();
	formData.append('filename', filename);
	$.ajax({
    type: 'POST',
    url: route+'delete',
    data: formData,
    contentType: false,
    cache: false,
    processData: false,
    async: false,
    success: function(result) {
		if (result == 'TRUE'){
			file_editing = $('#file_editing').html();
			//Dropzone.prototype.removeFilename(filename);
			$('span:contains(\''+filename+'\')').parent().parent().parent().remove(); //remove from dropzone
			if(filename == file_editing) //close ace editor if the file editing is the file deleted
				hide();
			if ($('.dz-preview').html() == undefined) //show "Drop files here to upload"
				$(".dz-message").css('display', 'block');
			alerta('Success', 'File '+filename+' deleted successfully!');
		}else
			alerta('Error', 'Error deleting file '+filename+'!');
		
    },
	});
	listFiles();
}

//refresh the list of files in the folder
function listFiles(){
	$('#uploadedList').html('');
	$('#list').html('');
	$.ajax({
            type: 'POST',
            url: route+'listUploads',
            contentType: false,
            cache: false,
            processData: false,
            async: false,
            success: function(result) {
				list = eval(result);
				n=0;
				for(i=0;i<list.length;i++){
					if(n % 2)
						color = '#E5E5E5';
					else
						color = '#C0C0C0';
					
					if($('span:contains(\''+list[i]+'\')').html() != undefined){
						color = '#FA8072';
					}
					div = '<div style="background-color:'+color+';float:left;padding:5px;border-bottom:2px solid black;width:100%;"><div style="float:left;text-align:left;">'+list[i]+'</div><div style="float:right;padding-right:15px;width:100px;"><button onClick="javascript:editar(\''+list[i]+'\')" class="small">Edit</button>&nbsp;';
					split = list[i].split('.')
					ext = split[split.length-1]
					if(ext.toLowerCase() == 'py'){
						div += '<button onClick="javascript:confirmTime(\''+list[i]+'\')" class="small">Execute</button>&nbsp;';
					}
					if(list[i] != 'simulation.py' && list[i] != 'Makefile'){
						div += '<button onClick="javascript:deletar(\''+list[i]+'\')" class="small">Delete</button></div>';
					}
					div += '</div>';
					
					if($('span:contains(\''+list[i]+'\')').html() != undefined){
						if($('#uploadedList').html() == '')
							$('#uploadedList').append('<font color="#CD5C5C" style="font-size:12px;font-style:italic;">Uploaded files are red marked</font>');
						$('#uploadedList').append(div);
					}else{
						$('#list').append(div);
						n+=1;
					}
				}
            },
    });
	
}

//compile the app for micaz simulation with tossim
function compileMicaz(){
	shellexec(function(output){
		openConsole();
		$('#Console-log').html(output);
	}, 'make --directory='+tinyos_dir+' -I '+tinyos_dir+' micaz sim', 'local');
}

function openCooja(){
	coojaexec(function(output){
		openConsole();
		$('#Console-log').html(output);
	}, "ant run",'cooja');
}

//execute a command in shell and shows in console the return
function shellexec(handleData, cmd, local){
	local = local || 'local';
	formData = new FormData();
	formData.append('cmd', cmd);
	showProcessing();
	setTimeout(function(){
			$.ajax({
		            type: 'POST',
		            url: route+local+'exec',
		            contentType: false,
					data: formData,
		            cache: false,
		            processData: false,
		            async: false,
		            success: function(result) {
						$('#processing').css('display', 'none');
						handleData(result);
		            }

		    });
	}, 100);

}

function coojaexec(handleData, cmd, local){
	local = local || 'local';
	formData = new FormData();
	formData.append('cmd', cmd);
	showProcessing();
	setTimeout(function(){
			$.ajax({
		            type: 'GET',
		            url: route+local+'exec',
		            contentType: false,
					data: formData,
		            cache: false,
		            processData: false,
		            async: false,
		            success: function(result) {
						$('#processing').css('display', 'none');
						handleData(result);
		            }

		    });
	}, 100);

}

//shows the dialog processing...
function showProcessing(){
	createElement('processing');
	$('#processing').css('display', 'block');
	$('#processing').css('background-image', 'linear-gradient(to bottom,#337ab7 0,#265a88 100%)');
	$('#processing').css('top', $( window ).height()/2-40);
	$('#processing').css('left', $( window ).width()/2-100);
	$('#processing').html('<center><font color=black>Processing...</font><BR><img src="static/images/load.gif"></center>');
}

//ask if you really want to close the file if you have not saved changes
function fileClose(){
	if(changed == 1){
	  confirma('Unsaved changes', 'Are you sure you want to close the file? All the changes will be lost.', 'hide()');
    }else{
		hide();
    }
}

//open ace editor with the filename
function editar(filename){
	var formData = new FormData();
	formData.append('filename', filename);
	       $.ajax({
            type: 'POST',
            url: route+'readFilename',
            data: formData,
            contentType: false,
            cache: false,
            processData: false,
            async: false,
            success: function(result) {
				if(changed == 1){
					if(!confirma('Unsaved changes', 'Are you sure you want to close the actual file? All the changes will be lost.', 'hide()'))
						return false;
				}
				
				editor.setValue(result);
				split = filename.split('.');
				ext = split[split.length-1];
				if(ext == 'py' || ext == 'PY')
					editor.getSession().setMode("ace/mode/python");
				else if(ext == 'c' || ext == 'C')
					editor.getSession().setMode("ace/mode/c_cpp");
				else if(ext == 'nc' || ext == 'NC')
					editor.getSession().setMode("ace/mode/c_cpp");
				$('#file_editing').html(filename);
				if(document.getElementById('edit').style.display == 'none'){
					$('#edit').css('width', '0');
					$('#edit').css('display', 'block');
					$('#files').animate({ width: '30%' }, 400 );
					$('#edit').animate({ width: '70%' }, 400 );
				}
				changed = 0;
            },
        });
	
}

//close ace editor
function hide(){
	editor.setValue('');
	$('#file_editing').html('');
	$('#edit').css('display', 'none');
	$('#files').animate({ width: '100%' }, 400 );
	$('#edit').animate({ width: '0' }, 400 );
	window.setTimeout("$('#edit').css('display', 'none');", 500);
	changed = 0;
	listFiles();
}

//save changes overwriting the file
function fileSave(){
	var formData = new FormData();
	file_editing = $('#file_editing').html();
	formData.append('filename', file_editing);
	formData.append('content', editor.getValue());
	       $.ajax({
            type: 'POST',
            url: route+'saveFilename',
            data: formData,
            contentType: false,
            cache: false,
            processData: false,
            async: false,
            success: function(result) {
				changed = 0;
				if(result == "TRUE")
					alerta('Success', 'File saved successfully!');
				else
					alerta('Error', 'Error while saving the file!');
            },
        });
}

//confirms the execution time
function confirmTime(filename){
	minutes = 10;
  	confirma('Time limit', 'Make sure you code do not have an infinite loop, we set the time limit to '+minutes+' minutes!', 'executeFile("'+filename+'", '+minutes+');');
}

//execute the file and shows the result in console
function executeFile(filename, minutes){
	var formData = new FormData();
	formData.append('filename', filename);
	formData.append('minutes', minutes);
	showProcessing();
	setTimeout(function(){
		
	$.ajax({
    type: 'POST',
    url: route+'execute',
    data: formData,
    contentType: false,
    cache: false,
    processData: false,
    async: false,
    success: function(result) {
		$('#Console-log').html('');
		$('#Console-log').append(result);
		openConsole();
		$('#processing').css('display', 'none');
	}
	});
	
	}, 100);
}

//open the console
function openConsole(){
	if($('#console').css('display') != 'block'){
		h -= consoleh;
		$('#console').css('display', 'block');
		if(document.getElementById('edit')){
		$('#console').animate({ 'margin-top': h+20 }, 400 );
			$('#edit').animate({ height: h }, 400 );
			$('#editor').animate({ height: h-40 }, 400 );
			$('#maxsizelist').animate({ height: h-30 }, 400 );
			$('#files').animate({ height: h }, 400 );
		}
		if(document.getElementById('experiments')){
			$('#console').animate({ 'margin-top': 10 }, 400 );
			$('#experiments').animate({ height: h }, 400 );
		}
	}
}

//close the console
function closeConsole(){
	if($('#console').css('display') == 'block'){
		h += consoleh;
		$('#console').animate({ 'margin-top': h+20 }, 400 );
		if(document.getElementById('edit')){
			$('#edit').animate({ height: h }, 400 );
			$('#editor').animate({ height: h-40 }, 400 );
			$('#maxsizelist').animate({ height: h-10 }, 400 );
			$('#files').animate({ height: h }, 400 );
		}
		if(document.getElementById('experiments')){
			$('#experiments').animate({ height: h }, 400 );
		}
		$('#console').css('display', 'none');
	}
}

//alert the user with a message
function alerta(title, msg){

	createElement('alert');
	$('#alert').html(msg);
	$( "#alert" ).dialog({
		autoOpen: false,
		width: 400,
		title: title,
		buttons: [
			{
				text: "OK",
				click: function() {
					$( this ).dialog( "close" );
					$( this ).remove();
				}
			}
		],
    	open: function(event, ui){
   		 setTimeout("$('#alert').dialog('close')",3000);
   	 	}
	});
	$('#alert').dialog("open");
}

//show a dialog to the user with a message to confirm or cancel
function confirma(title, msg, func){
	
	createElement('confirma');
	$('#confirma').html(msg);
	$( "#confirma" ).dialog({
		autoOpen: false,
		width: 400,
		title: title,
		buttons: [
			{
				text: "OK",
				click: function() {
					$( this ).dialog( "close" );
					$( this ).remove();
					window.setTimeout(func, 0);
				}
			},
			{
				text: "Cancel",
				click: function() {
					$( this ).dialog( "close" );
					$( this ).remove();
					return false;
				}
			}
		]
	});
	$('#confirma').dialog("open");
}

//create a div element in the body with display:none
function createElement(name){
	div = document.getElementById(name);
	if(div == undefined){
		div = document.createElement('div');
		div.setAttribute('id', name);
		div.setAttribute('style', 'display:none');
		body = document.getElementsByTagName('body');
		body[0].appendChild(div);
	}
	return div;
}