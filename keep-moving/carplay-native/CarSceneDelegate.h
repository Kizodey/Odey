#import <UIKit/UIKit.h>
#import <CarPlay/CarPlay.h>

/**
 * Scene delegate for the CarPlay display. Referenced from Info.plist
 * (UIApplicationSceneManifest -> CarPlay -> CarSceneDelegate) and added to
 * the Xcode project after `npx expo prebuild -p ios`.
 */
@interface CarSceneDelegate : UIResponder <CPTemplateApplicationSceneDelegate>
@end
