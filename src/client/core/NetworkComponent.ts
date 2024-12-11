import { Component } from "./BaseComponent";
import { NetworkManager } from "../utils/NetworkManager";

export class NetworkComponent extends Component {
  public readonly name = "network";
  private lastPosition: { x: number; y: number } = { x: 0, y: 0 };
  public readonly networkManager: NetworkManager;

  constructor(networkManager: NetworkManager) {
    super();
    this.networkManager = networkManager;
  }

  public update(): void {
    const currentPosition = this.entity?.getPosition();
    if (
      currentPosition &&
      (currentPosition.x !== this.lastPosition.x ||
        currentPosition.y !== this.lastPosition.y)
    ) {
      this.networkManager.emitPlayerMove(currentPosition);
      this.lastPosition = currentPosition;
    }
  }
}
