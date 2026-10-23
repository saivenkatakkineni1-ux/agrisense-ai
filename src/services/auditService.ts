import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { AuditLog } from '../types';

const AUDIT_COLLECTION = 'audit_logs';

export async function recordAuditLog(
  action: string,
  actorId: string,
  actorRole: string,
  actorEmail: string | undefined,
  targetEntity: string,
  details: string
): Promise<string | null> {
  try {
    const logData: Omit<AuditLog, 'id'> = {
      action,
      actorId,
      actorRole,
      actorEmail: actorEmail || 'unspecified@auth',
      targetEntity,
      details,
      timestamp: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, AUDIT_COLLECTION), logData);
    return docRef.id;
  } catch (error) {
    // If user is unauthenticated or permission denied during startup test, log to console gracefully
    console.warn('Audit logging error:', error);
    return null;
  }
}

export async function fetchRecentAuditLogs(maxRecords: number = 30): Promise<AuditLog[]> {
  try {
    const q = query(collection(db, AUDIT_COLLECTION), orderBy('timestamp', 'desc'), limit(maxRecords));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<AuditLog, 'id'>),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, AUDIT_COLLECTION);
    return [];
  }
}
