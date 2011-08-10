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
function tokboxArchvie(){
	var API_KEY = "1157291";
	var SESSION_ID = "144496bf21de5de084504bda1450bdc9e46b98d8";
	var TOKEN = "moderator_token";
	var subscribers = {};
	var mySession;
	var publisher;
	var myArchive;
	var archiveCreated = false;
	var head_count = 1;
	var playback_index = 1;
	
	this.start_tb = start_tb;
	this.createArchive = createArchive;
	this.recordSession = recordSession;
	this.stopRecordingSession = stopRecordingSession;
	this.startPlayback = startPlayback;
	this.stopPlayback = stopPlayback;
	this.playback_index = playback_index;
	
	// Called when the page is loaded. Initializes an OpenTok session.
	function start_tb(){
		console.log('start tb called');
		TB.addEventListener(TB.EXCEPTION, exceptionHandler);
		if (API_KEY == "" || SESSION_ID == "") {
			var error_message = "This page cannot connect. Please edit the" +
			"API_KEY and SESSION_ID values in the source code.";
			window.document.write(error_message);
			return;
		}
		mySession = TB.initSession(SESSION_ID);
		mySession.addEventListener("sessionConnected", sessionConnectedHandler);
		mySession.addEventListener("sessionDisconnected", sessionDisconnectedHandler);
		mySession.addEventListener("streamCreated", streamCreatedHandler);
		mySession.addEventListener("streamDestroyed", streamDestroyedHandler);
		connect();
	}
	
	// Connects to the OpenTok session.
	function connect(){
		mySession.connect(API_KEY, TOKEN);
	}
	
	// Disconnects from the OpenTok session.
	function disconnect(){
		mySession.disconnect();
	}
	
	// Called when the user clicks the Publish link. Publishes the local webcam's stream to the session.
	function publish(){
		if (!publisher) {
			var div = document.createElement('div');
			div.setAttribute('id', 'publisher');
			var publisherContainer = document.getElementById('my_camera');
			publisherContainer.appendChild(div);
			
			var publisherProps = {
				width: 200,
				height: 200,
				publishAudio: true
			};
			
			publisher = mySession.publish('publisher', publisherProps);
			
			//$("#camera_button").fadeIn('slow');
		}
	}
	
	// Called when the user clicks the Unpublish link.
	function unpublish(){
		if (publisher) {
			mySession.unpublish(publisher);
		}
		publisher = null;
		
		$("#recording_container").fadeOut('slow', function(){
			$("#playback_container").fadeIn('slow');
		});
		
	}
	
	/* Called when the session connects. Subscribes existing streams. Adds links in
	 * the page to publish and disconnect. For moderators, adds event listeners for
	 * events related to archiving.
	 */
	function sessionConnectedHandler(event){
		publish();
		for (var i = 0; i < event.streams.length; i++) {
			addStream(event.streams[i]);
		}

		if (mySession.capabilities.record) {
			mySession.addEventListener("sessionRecordingStarted", sessionRecordingStartedHandler);
			mySession.addEventListener("archiveCreated", archiveCreatedHandler);
			mySession.addEventListener("archiveClosed", archiveClosedHandler);
			mySession.addEventListener("sessionRecordingStopped", sessionRecordingStoppedHandler);
		}
		if (mySession.capabilities.playback) {
			mySession.addEventListener("archiveLoaded", archiveLoadedHandler);
			mySession.addEventListener("playbackStarted", playbackStartedHandler);
			mySession.addEventListener("playbackStopped", playbackStoppedHandler);
		}
	}
	
	function sessionDisconnectedHandler(event){
		// Remove the publisher
		if (publisher) {
			unpublish();
		}
		// Remove all subscribers
		for (var streamId in subscribers) {
			removeStream(streamId);
		};		
	}
	
	function streamCreatedHandler(event){
		for (var i = 0; i < event.streams.length; i++) {
			addStream(event.streams[i]);
		}
	}
	
	function streamDestroyedHandler(event){
		for (var i = 0; i < event.streams.length; i++) {
			removeStream(event.streams[i].streamId);
			
			if (mySession.getPublisherForStream(event.streams[i]) == publisher) {
				unpublish();
			}
		}
	}
	
	function removeStream(streamId){
		var subscriber = subscribers[streamId];
		if (subscriber) {
			mySession.unsubscribe(subscriber);
			delete subscribers[streamId];
			
			$("#playback_1").html("");
			$("#playback_2").html("");
		}
	}
	
	/* Subscribes to a stream and adds it to the page. The type of stream,
	 *  "live" or "recorded", is added as a label below the stream display.
	 */
	function addStream(stream){
		// Do not subscribe to a stream the current user is publishing.
		if (stream.connection.connectionId == mySession.connection.connectionId) {
			$("#camera_button").fadeIn('slow');
			return;
		}
		
		var subscriberDiv = document.createElement('div');
		subscriberDiv.setAttribute('id', stream.streamId);
		
		switch (stream.type) {
			// Playback Sscreen
			case "archived":
				$("#playback_" + head_count).append(subscriberDiv);
				var subscriberProps = {
					width: 150,
					height: 150,
					subscribeToAudio: true
				};
				head_count = head_count + 1;
				if (head_count == 3) {
					head_count = 1;
				}
				break;
				// Record Screen
			case "basic":
				$("#their_camera").append(subscriberDiv);
				var subscriberProps = {
					width: 200,
					height: 200,
					subscribeToAudio: true
				};
				break;
		}
		console.log("stream being added");
		
		subscribers[stream.streamId] = mySession.subscribe(stream, subscriberDiv.id, subscriberProps);
	}
	
	/* Called in response to the moderator clicking the "Create archive" link.
	 * Creates an archive and creates a unique name for it (based on a timestamp).
	 */
	function createArchive(){
		var uniqueTitle = "archive" + new Date().getTime();
		mySession.createArchive(API_KEY, "perSession", uniqueTitle);
	}
	
	// Called in response to the archiveCreated event. The moderator can now record the session.
	function archiveCreatedHandler(event){
		myArchive = event.archives[0];
		archiveCreated = true;
	}
	
	function recordSession(){
		mySession.startRecording(myArchive);
	}
	
	// Called in response to the sessionRecordingStarted event. The moderator can now stop recording.
	function sessionRecordingStartedHandler(event){
		//show("stopRecordingSessionLink");
	}
	
	/* Called in response to the moderator clicking the "Stop recording" link.
	 * Stops the recording.
	 */
	function stopRecordingSession(){
		mySession.stopRecording(myArchive);
		console.log("Stop Recording Session");
	}
	
	// Called in response to the sessionRecordingStopped event. The moderator can now close the archive.
	function sessionRecordingStoppedHandler(event){
		closeArchive();
	}
	
	/* Called in response to the moderator clicking the "Close archive" link.
	 * Closes the archive.
	 */
	function closeArchive(){
		mySession.closeArchive(myArchive);
	}
	
	// Called in response to the archiveClosed event. The moderator can now load the archive (and play it back).
	function archiveClosedHandler(event){
		loadArchive();
		unpublish();
	}
	
	/* Called in response to the moderator clicking the "Load archive" link.
	 * Loads the archive that was just recorded.
	 */
	function loadArchive(){
		mySession.loadArchive(myArchive.archiveId);
	
	}
	
	// Called in response to the archiveLoaded event. The moderator can now start playing back the archive.
	function archiveLoadedHandler(event){
		myArchive = event.archives[0];
	}
	
	/* Called in response to the moderator clicking the "Start playback" link.
	 * Starts playing back the archive.
	 */
	function startPlayback(){
		$("#play_button").css("background-image", "url(assets/stop.png)");
		myArchive.startPlayback();
	}
	
	// Called in response to the playbackStarted event. The moderator can now (optionally) stop playing back the archive.
	function playbackStartedHandler(event){
		console.log("playback_index:" + playback_index);
	}
	
	/* Called in response to the moderator clicking the "Stop playback" link.
	 * Stops playing back the archive.
	 */
	function stopPlayback(){
		$("#play_button").css("background-image", "url(assets/play.png)");
		myArchive.stopPlayback();
	}
	
	// Called in response to the playbackStopped event. The moderator can now (optionally) play back the archive again.
	function playbackStoppedHandler(event){
		$("#play_button").css("background-image", "url(assets/play.png)");
		playback_index = 1;
		console.log("playback_index:" + playback_index);
	}
	
	function exceptionHandler(event){
		alert("Exception! msg: " + event.message + " title: " + event.title + " code: " + event.code);
	}
}