# utils/helpers.py
def to_dict(instance, fields):
    return {field: getattr(instance, field) for field in fields}
