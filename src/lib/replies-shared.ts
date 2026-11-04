/** Shapes shared by the reply card, the server and the couple's guest list. */

export type Reply = {
  id: string;
  /** ISO time the reply was sent */
  submittedAt: string;
  name: string;
  attending: "yes" | "no";
  /** People coming, including the guest. 0 when not attending. */
  guests: number;
  /** Names of the people coming with them */
  companions: string;
  /** Food allergies or diet needs */
  dietary: string;
  contact: string;
  message: string;
  /** Name from the personal invitation link (?to=) */
  inviteName: string;
  /** Seats from the personal invitation link (?seats=) */
  seatsOffered: number;
  /** Set by the couple: the table this guest sits at */
  table: string;
  /** Set by the couple: private notes */
  notes: string;
};

export type NewReply = Omit<Reply, "id" | "submittedAt" | "table" | "notes">;

/** The fields the couple can change from the guest list. */
export type GuestDetails = Pick<Reply, "table" | "notes">;

export const DETAIL_LIMITS: Record<keyof GuestDetails, number> = { table: 40, notes: 500 };

/** Where replies are kept: the Google Sheet, a file on this computer (development only), or nowhere yet. */
export type ReplySource = "sheet" | "local" | "none";
