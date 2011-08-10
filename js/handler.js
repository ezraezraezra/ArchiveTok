/*
 * Project:     Archive
 * Description: Simple analogy for the OpenTok Archiving API
 * Website:     http://archive.opentok.com
 * 
 * Author:      Ezra Velazquez
 * Website:     http://ezraezraezra.com
 * Date:        June 2011
 * 
 */

$(document).ready(function() {
	loadHandlers();
});

var loadHandlers = function() {
	var recording_phase = 0;
	var timer_counter_stop = false;
	var timer_counter = 1;
	//var playback_index = 1;
	var tbArchive = new tokboxArchvie();
	
	tbArchive.start_tb();
	
	$("#camera_button").click(function() {
		switch (recording_phase) {
			case 0:
				$(this).fadeOut('slow', function(){
					$(this).html('record');
					$("#camera").css("background-image", "url(assets/camera_b.png)");
					$(this).fadeIn('slow');
				});
				recording_phase = 1;
				tbArchive.createArchive();
				break;
			case 1:
				$(this).fadeOut('slow', function(){
					$(this).html('stop');
					$(this).fadeIn('slow');
				});
				recording_phase = 2;
				blink_button();
				tbArchive.recordSession();
				break;
			case 2:
				//stop is pressed, take user to other screen
				recording_phase = 3;
				timer_counter_stop = true;
				tbArchive.stopRecordingSession();
				break;
		}
	});
		
	$("#camera_button").mouseover(function(){
		if (recording_phase == 0) {
			$(this).css("backgroundColor", "grey");
		}
		if (recording_phase == 1) {
			$(this).css("backgroundColor", "red");
		}
	});
	
	$("#camera_button").mouseout(function(){
		if (recording_phase == 0) {
			$(this).css("backgroundColor", "white");
		}
		if (recording_phase == 1) {
			$(this).css("backgroundColor", "white");
		}
	});
	
	$("#play_button").click(function(){
		if (tbArchive.playback_index == 1) {
			//startPlayback();
			tbArchive.playback_index = 2;
			tbArchive.startPlayback();
			
			console.log("starting playback");
		}
		else {
			console.log("stopping playback");
			//stopPlayback();
			tbArchive.stopPlayback();
			tbArchive.playback_index = 1;
		}	
	});
	
	/*
	 * HELPER FUNCTIONS
	 */	
	function blink_button(){
		if (timer_counter == 1) {
			timer_counter = 2;
			$("#camera_button").css("backgroundColor", "red");
		}
		else {
			$("#camera_button").css("backgroundColor", "white");
			timer_counter = 1;
		}
		if (timer_counter_stop == false) {
			t = setTimeout(blink_button, 1500);
		}
	}	
}