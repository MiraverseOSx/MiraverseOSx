import Phaser from 'phaser';
import { FIELD_TARGETS, type FieldSession } from '../../gameplay/FieldOperations';

export function createTunnelGame(parent: HTMLElement, initial: FieldSession, onMove: (x: number, y: number) => void, onInspect: (id: string) => void) {
  let scene: TunnelScene;
  class TunnelScene extends Phaser.Scene {
    avatar!: Phaser.GameObjects.Container;
    destination: { x: number; y: number; id?: string } | null = null;
    keys = new Set<string>();
    elapsed = 0;
    create() {
      scene = this;
      const g = this.add.graphics();
      g.fillStyle(0x101d20).fillRect(0, 0, 960, 600);
      g.lineStyle(1, 0x21383a);
      for (let x = 40; x < 960; x += 40) g.lineBetween(x, 90, x, 550);
      for (let y = 110; y < 550; y += 40) g.lineBetween(40, y, 920, y);
      g.fillStyle(0x253a3c).fillRoundedRect(65, 265, 830, 100, 12);
      g.lineStyle(3, 0x60766b).lineBetween(65, 285, 895, 285).lineBetween(65, 345, 895, 345);
      g.lineStyle(2, 0xbaaB83, 0.45).strokeRoundedRect(48, 95, 864, 450, 18);
      g.lineStyle(5, 0x47766b).lineBetween(210, 205, 210, 245).lineBetween(210, 245, 720, 245).lineBetween(720, 245, 720, 205);
      this.add.text(48, 30, 'TUNNEL 09', { fontFamily: 'Georgia', fontSize: '30px', color: '#f0d9e4' });
      this.add.text(912, 42, 'SUB-AURELINE / SERVICE LEVEL', { fontFamily: 'monospace', fontSize: '12px', color: '#a9c4b7' }).setOrigin(1, 0);
      this.add.text(65, 560, 'PUBLIC PLATFORM SEALED   /   FIELD CHANNEL 09', { fontFamily: 'monospace', fontSize: '12px', color: '#a9b6a6' });
      FIELD_TARGETS.forEach((target, index) => {
        const ring = this.add.circle(target.x, target.y, 32, 0x73978c, 0.10).setStrokeStyle(1, 0x78988c);
        this.tweens.add({ targets: ring, alpha: 0.4, duration: 1500 + index * 120, yoyo: true, repeat: -1 });
        if (target.id === 'witness') {
          this.add.circle(target.x, target.y - 9, 9, 0xd3cbc1);
          this.add.rectangle(target.x, target.y + 11, 22, 23, 0x806c79).setStrokeStyle(2, 0xc1a0ac);
        } else {
          this.add.rectangle(target.x, target.y, target.id === 'seal' ? 58 : 36, 30, 0x3b4a38).setStrokeStyle(2, 0xbaba9e);
          this.add.rectangle(target.x, target.y - 2, 22, 5, 0x90c6b0);
        }
        this.add.text(target.x, target.y + 42, target.label, { fontFamily: 'monospace', fontSize: '13px', color: '#f0e6d8', backgroundColor: '#101d20', padding: { x: 5, y: 4 } }).setOrigin(0.5);
      });
      const shadow = this.add.ellipse(0, 15, 34, 14, 0x000000, 0.4);
      const halo = this.add.circle(0, 0, 42, 0xf0d9e4, 0.07);
      const body = this.add.rectangle(0, 7, 22, 24, 0xc1a0ac).setStrokeStyle(2, 0xf0d9e4);
      const head = this.add.circle(0, -11, 9, 0xf0d9e4);
      this.avatar = this.add.container(initial.x, initial.y, [halo, shadow, body, head]).setDepth(10);
      this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        const target = FIELD_TARGETS.find(item => Math.hypot(item.x - pointer.x, item.y - pointer.y) < 65);
        this.destination = { x: Phaser.Math.Clamp(pointer.x, 70, 890), y: Phaser.Math.Clamp(pointer.y, 110, 510), id: target?.id };
      });
    }
    update(_time: number, delta: number) {
      if (!this.avatar) return;
      const dx = Number(this.keys.has('d') || this.keys.has('ArrowRight')) - Number(this.keys.has('a') || this.keys.has('ArrowLeft'));
      const dy = Number(this.keys.has('s') || this.keys.has('ArrowDown')) - Number(this.keys.has('w') || this.keys.has('ArrowUp'));
      if (dx || dy) this.destination = null;
      const destination = this.destination;
      let vx = dx, vy = dy;
      if (destination) { vx = destination.x - this.avatar.x; vy = destination.y - this.avatar.y; }
      const distance = Math.hypot(vx, vy), step = Math.min(180 * Math.min(delta, 50) / 1000, destination ? distance : 180 * delta / 1000);
      if (distance > 1) {
        this.avatar.x = Phaser.Math.Clamp(this.avatar.x + vx / distance * step, 70, 890);
        this.avatar.y = Phaser.Math.Clamp(this.avatar.y + vy / distance * step, 110, 510);
        this.elapsed += delta;
        if (this.elapsed > 400) { onMove(this.avatar.x, this.avatar.y); this.elapsed = 0; }
      }
      if (destination && distance < (destination.id ? 55 : 3)) {
        this.destination = null; onMove(this.avatar.x, this.avatar.y);
        if (destination.id) onInspect(destination.id);
      }
    }
  }
  const game = new Phaser.Game({ type: Phaser.AUTO, parent, backgroundColor: '#101d20',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 960, height: 600 }, scene: TunnelScene,
    audio: { noAudio: true } });
  return { game,
    travel(id: string) { const target = FIELD_TARGETS.find(item => item.id === id); if (scene && target) scene.destination = { ...target }; },
    key(key: string, down: boolean) { if (scene) down ? scene.keys.add(key) : scene.keys.delete(key); },
    stop() { if (scene?.avatar) { scene.keys.clear(); scene.destination = null; onMove(scene.avatar.x, scene.avatar.y); } },
  };
}
