import { Material } from '../entities/material.entity';

export interface IMaterialRepository {
  create(material: Material): Promise<Material>;
  findAll(): Promise<Material[]>;
  findOne(id: string): Promise<Material | null>;
  update(id: string, material: Partial<Material>): Promise<Material | null>;
  delete(id: string): Promise<void>;
}
