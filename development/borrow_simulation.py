# Library self-borrowing kiosk simulation
# Test A: normal scan, Test B: damaged barcode scan
import random

scan_fail_counter = 0
MAX_RETRY = 2

def kiosk_borrow(student_id_valid:bool, barcode_readable:bool):
    global scan_fail_counter
    print("\n==== Library Self-service Kiosk ====")
    if not student_id_valid:
        return "Error: Cannot read student card. Please re-tap your student ID."
    
    if barcode_readable:
        scan_fail_counter = 0
        return "Success! Book borrowed. Receipt printed."
    else:
        scan_fail_counter += 1
        base_msg = "Error: Barcode not recognised."
        hint_msg = " Possible cause: damaged barcode label or poor book position."
        if scan_fail_counter >= MAX_RETRY:
            highlight = "\n[Important] Please press 'Call staff help' for manual support."
            return base_msg + hint_msg + highlight
        return base_msg + hint_msg

# Test A - Normal case
print("---- Test A: Valid ID + good barcode ----")
print(kiosk_borrow(True, True))

# Test B - Fault case: valid ID + damaged barcode
print("\n---- Test B: Valid ID + unreadable barcode (scan attempt 1) ----")
print(kiosk_borrow(True, False))
print("\n---- Test B: Valid ID + unreadable barcode (scan attempt 2) ----")
print(kiosk_borrow(True, False))
