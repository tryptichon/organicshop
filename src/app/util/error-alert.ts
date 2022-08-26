/**
 * A very simple class to display any content and log it to the console.
 */
export class Alert {

  /**
   * Try to decode the content, log it in the console and display an alert box.
   *
   * @param content Any content. Often error data from an exception.
   */
  public static show(content: any) {
    console.log(content);
    let message = (typeof content === 'string') ? content : JSON.stringify(content);
    alert(message);
  }

}
