package {
	
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.external.ExternalInterface;
	import flash.system.Security;
	import flash.system.System;
	import flash.media.Sound;
	import flash.media.SoundChannel;
	import flash.media.SoundTransform;
	import flash.net.URLRequest;
	
	//import ru.pixeltyumen.utils.DebugConsoleConnector;
	
	/**
	 * ...
	 * @author piksel@mail.ru
	 */
	public class Main extends Sprite {
		
		private var _transform:SoundTransform;
		private var _sound:Sound;
		private var _url:String;
		private var _channel:SoundChannel;
		
		public function Main ():void {
			if (stage) _init();
			else addEventListener(Event.ADDED_TO_STAGE, _init);
		}
		
		private function _init (e:Event = null):void {
			removeEventListener(Event.ADDED_TO_STAGE, _init);
			
			_transform = new SoundTransform(0);
			
			//DebugConsoleConnector.instance.log('init');
			
			if (ExternalInterface.available) {
				Security.allowDomain('*');
				ExternalInterface.addCallback('source', _source);
				ExternalInterface.addCallback('play', _play);
				ExternalInterface.addCallback('pause', _pause);
				ExternalInterface.addCallback('volume', _volume);
			}
		}
		
		private function _source (url:*):void {
			_url = String(url);
			_pause();
			try {
				_sound = new Sound( new URLRequest(_url) );
			} catch (e:Error) { }
		}
		
		private function _play ():void {
			_pause();
			try {
				_channel = _sound.play(0, 0, _transform);
			} catch (e:Error) { }
		}
		
		private function _pause ():void {
			try {
				_channel.stop();
			} catch (e:Error) { }
			System.gc();
		}
		
		private function _volume (value:*):void {
			_transform.volume = Number(value);
			try {
				_channel.soundTransform = _transform;
			} catch (e:Error) { }
		}
		
	}
	
}